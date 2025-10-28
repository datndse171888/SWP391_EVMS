import { Request, Response } from 'express';
import { VehicleConditionReport } from '../models/VehicleConditionReport.js';
import { Appointment } from '../models/Appointment.js';
import { Technician } from '../models/Technician.js';

// Create Vehicle Condition Report
export async function createVehicleConditionReport(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { appointmentId } = req.params;
    const { stage, details, images = [] } = req.body;

    // Validate required fields
    if (!stage) {
      return res.status(400).json({
        success: false,
        message: 'Stage is required'
      });
    }

    // Validate stage enum
    const validStages = ['before-service', 'after-service', 'intermediate'];
    if (!validStages.includes(stage)) {
      return res.status(400).json({
        success: false,
        message: `Invalid stage. Must be one of: ${validStages.join(', ')}`
      });
    }

    // Find appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check permissions
    const role = req.user.role;
    let technicianId = req.user.id;

    if (role === 'technician') {
      // Check if technician is assigned to this appointment
      const isAssigned = appointment.technicianLeaderID?.toString() === req.user.id ||
                        appointment.technicianSupport1ID?.toString() === req.user.id ||
                        appointment.technicianSupport2ID?.toString() === req.user.id;

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'You can only create reports for appointments assigned to you'
        });
      }

      // Find technician record
      const technician = await Technician.findOne({ userID: req.user.id });
      if (!technician) {
        return res.status(404).json({
          success: false,
          message: 'Technician record not found'
        });
      }
      technicianId = technician._id.toString();
    } else if (role === 'admin' || role === 'staff') {
      // Admin/Staff can specify technicianId in body
      if (req.body.technicianId) {
        technicianId = req.body.technicianId;
      } else {
        // Use first assigned technician as default
        technicianId = appointment.technicianLeaderID?.toString() || 
                      appointment.technicianSupport1ID?.toString() || 
                      appointment.technicianSupport2ID?.toString();
        
        if (!technicianId) {
          return res.status(400).json({
            success: false,
            message: 'No technician assigned to this appointment'
          });
        }
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Only admin, staff, and technicians can create reports'
      });
    }

    // Check for duplicate before-service or after-service
    if (stage === 'before-service' || stage === 'after-service') {
      const existingReport = await VehicleConditionReport.findOne({
        appointmentID: appointmentId,
        stage: stage
      });

      if (existingReport) {
        return res.status(409).json({
          success: false,
          message: `A ${stage} report already exists for this appointment`
        });
      }
    }

    // Create report
    const report = await VehicleConditionReport.create({
      appointmentID: appointmentId,
      technicianID: technicianId,
      stage,
      details,
      images
    });

    // Populate related data
    const populatedReport = await VehicleConditionReport.findById(report._id)
      .populate('appointmentID', 'bookingDate status userID serviceID')
      .populate({
        path: 'technicianID',
        select: 'userID introduction experience',
        populate: {
          path: 'userID',
          select: 'userName fullName email phoneNumber'
        }
      });

    return res.status(201).json({
      success: true,
      message: 'Vehicle condition report created successfully',
      data: {
        report: populatedReport
      }
    });

  } catch (error) {
    console.error('Create vehicle condition report error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error when creating report'
    });
  }
}

// Get reports by appointment ID
export async function getReportsByAppointment(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { appointmentId } = req.params;
    const { stage } = req.query;

    // Find appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check permissions
    const role = req.user.role;
    const isOwner = String(appointment.userID) === req.user.id;
    const isAssignedTechnician = appointment.technicianLeaderID?.toString() === req.user.id ||
                               appointment.technicianSupport1ID?.toString() === req.user.id ||
                               appointment.technicianSupport2ID?.toString() === req.user.id;

    if (role === 'customer' && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You can only view reports for your own appointments'
      });
    }

    if (role === 'technician' && !isAssignedTechnician) {
      return res.status(403).json({
        success: false,
        message: 'You can only view reports for appointments assigned to you'
      });
    }

    // Build filter
    const filter: any = { appointmentID: appointmentId };
    if (stage) {
      filter.stage = stage;
    }

    // Get reports
    const reports = await VehicleConditionReport.find(filter)
      .populate('appointmentID', 'bookingDate status userID serviceID')
      .populate({
        path: 'technicianID',
        select: 'userID introduction experience',
        populate: {
          path: 'userID',
          select: 'userName fullName email phoneNumber'
        }
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Reports retrieved successfully',
      data: {
        reports,
        appointment: {
          id: appointment._id,
          bookingDate: appointment.bookingDate,
          status: appointment.status
        }
      }
    });

  } catch (error) {
    console.error('Get reports by appointment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error when retrieving reports'
    });
  }
}

// Get single report by ID
export async function getReportById(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { id } = req.params;

    const report = await VehicleConditionReport.findById(id)
      .populate('appointmentID', 'bookingDate status userID serviceID')
      .populate({
        path: 'technicianID',
        select: 'userID introduction experience',
        populate: {
          path: 'userID',
          select: 'userName fullName email phoneNumber'
        }
      });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check permissions
    const role = req.user.role;
    const appointment = report.appointmentID as any;
    const isOwner = String(appointment.userID) === req.user.id;
    const isAssignedTechnician = appointment.technicianLeaderID?.toString() === req.user.id ||
                               appointment.technicianSupport1ID?.toString() === req.user.id ||
                               appointment.technicianSupport2ID?.toString() === req.user.id;

    if (role === 'customer' && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You can only view reports for your own appointments'
      });
    }

    if (role === 'technician' && !isAssignedTechnician) {
      return res.status(403).json({
        success: false,
        message: 'You can only view reports for appointments assigned to you'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Report retrieved successfully',
      data: {
        report
      }
    });

  } catch (error) {
    console.error('Get report by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error when retrieving report'
    });
  }
}

// Update report
export async function updateReport(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { id } = req.params;
    const { details, images } = req.body;

    const report = await VehicleConditionReport.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Get appointment to check status
    const appointment = await Appointment.findById(report.appointmentID);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Associated appointment not found'
      });
    }

    // Check permissions
    const role = req.user.role;
    const isAssignedTechnician = appointment.technicianLeaderID?.toString() === req.user.id ||
                               appointment.technicianSupport1ID?.toString() === req.user.id ||
                               appointment.technicianSupport2ID?.toString() === req.user.id;

    if (role === 'technician') {
      if (!isAssignedTechnician) {
        return res.status(403).json({
          success: false,
          message: 'You can only update reports for appointments assigned to you'
        });
      }

      // Check if appointment is completed (technician can't edit after completion)
      if (appointment.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot update report after appointment is completed'
        });
      }
    } else if (role !== 'admin' && role !== 'staff') {
      return res.status(403).json({
        success: false,
        message: 'Only admin, staff, and assigned technicians can update reports'
      });
    }

    // Update report
    const updateData: any = {};
    if (details !== undefined) updateData.details = details;
    if (images !== undefined) updateData.images = images;

    const updatedReport = await VehicleConditionReport.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('appointmentID', 'bookingDate status userID serviceID')
     .populate({
       path: 'technicianID',
       select: 'userID introduction experience',
       populate: {
         path: 'userID',
         select: 'userName fullName email phoneNumber'
       }
     });

    return res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      data: {
        report: updatedReport
      }
    });

  } catch (error) {
    console.error('Update report error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error when updating report'
    });
  }
}

// Delete report
export async function deleteReport(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { id } = req.params;

    const report = await VehicleConditionReport.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check permissions - only admin and staff can delete
    const role = req.user.role;
    if (role !== 'admin' && role !== 'staff') {
      return res.status(403).json({
        success: false,
        message: 'Only admin and staff can delete reports'
      });
    }

    await VehicleConditionReport.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('Delete report error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error when deleting report'
    });
  }
}

// Get all reports (admin/staff only)
export async function getAllReports(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const role = req.user.role;
    if (role !== 'admin' && role !== 'staff') {
      return res.status(403).json({
        success: false,
        message: 'Only admin and staff can view all reports'
      });
    }

    const { 
      page = 1, 
      limit = 10, 
      stage, 
      appointmentId, 
      technicianId,
      from,
      to 
    } = req.query;

    // Build filter
    const filter: any = {};
    if (stage) filter.stage = stage;
    if (appointmentId) filter.appointmentID = appointmentId;
    if (technicianId) filter.technicianID = technicianId;
    
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from as string);
      if (to) filter.createdAt.$lte = new Date(to as string);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [total, reports] = await Promise.all([
      VehicleConditionReport.countDocuments(filter),
      VehicleConditionReport.find(filter)
        .populate('appointmentID', 'bookingDate status userID serviceID')
        .populate({
          path: 'technicianID',
          select: 'userID introduction experience',
          populate: {
            path: 'userID',
            select: 'userName fullName email phoneNumber'
          }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
    ]);

    return res.status(200).json({
      success: true,
      message: 'Reports retrieved successfully',
      data: {
        reports,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get all reports error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error when retrieving reports'
    });
  }
}
