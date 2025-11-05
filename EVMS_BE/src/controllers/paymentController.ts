import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Payment } from '../models/Payment.js';
import { Appointment } from '../models/Appointment.js';
import { Bill } from '../models/Bill.js';

// PayOS SDK - Cần cài đặt: npm install @payos/node
// import { PayOS } from '@payos/node';

// Tạm thời dùng fetch để gọi PayOS API trực tiếp
// Trong production, nên dùng PayOS SDK

const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID || '';
const PAYOS_API_KEY = process.env.PAYOS_API_KEY || '';
const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY || '';
const PAYOS_BASE_URL = process.env.PAYOS_BASE_URL || 'https://api-merchant.payos.vn';
const BACKEND_WEBHOOK_URL = process.env.BACKEND_WEBHOOK_URL || ''; // URL cho webhook (tunnel URL khi chạy local)

// Helper function để tạo PayOS payment link
async function createPayOSLink(data: {
  orderCode: number;
  amount: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}) {
  try {
    const response = await fetch(`${PAYOS_BASE_URL}/v2/payment-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': PAYOS_CLIENT_ID,
        'x-api-key': PAYOS_API_KEY,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('PayOS API Error:', error);
    throw error;
  }
}

// Tạo payment link PayOS
export async function createPayOSPayment(req: Request, res: Response) {
  try {
    const { appointmentId, amount, description, returnUrl, cancelUrl, note } = req.body;

    if (!appointmentId || !amount || !description || !returnUrl || !cancelUrl) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: appointmentId, amount, description, returnUrl, cancelUrl',
      });
    }

    // Validate appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch hẹn',
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền phải lớn hơn 0',
      });
    }

    // Tạo order code unique (timestamp hoặc random)
    const orderCode = Date.now() % 1000000000; // 9 digits max

    // Tạo payment record
    const payment = await Payment.create({
      appointmentID: new mongoose.Types.ObjectId(appointmentId),
      amount,
      paymentMethod: 'PAYOS',
      status: 'pending',
      note,
    });

    // Tạo PayOS payment link
    const payOSResponse = await createPayOSLink({
      orderCode,
      amount: Math.round(amount), // PayOS chỉ nhận số nguyên
      description,
      returnUrl,
      cancelUrl,
    });

    if (payOSResponse.code === 0 && payOSResponse.data) {
      // Update payment với paymentLinkId
      payment.paymentLinkId = payOSResponse.data.paymentLinkId || String(orderCode);
      payment.payOSData = {
        code: payOSResponse.code.toString(),
        desc: payOSResponse.desc || 'Success',
        data: payOSResponse.data,
      };
      await payment.save();

      return res.status(200).json({
        success: true,
        message: 'Tạo payment link thành công',
        data: {
          paymentLinkId: payment.paymentLinkId,
          checkoutUrl: payOSResponse.data.checkoutUrl,
          qrCode: payOSResponse.data.qrCode,
        },
      });
    } else {
      // Update payment status to failed
      payment.status = 'failed';
      await payment.save();

      return res.status(400).json({
        success: false,
        message: payOSResponse.desc || 'Không thể tạo payment link',
      });
    }
  } catch (error: any) {
    console.error('Error creating PayOS payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tạo payment link',
    });
  }
}

// Xác nhận thanh toán tiền mặt
export async function confirmCashPayment(req: Request, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { billId, note } = req.body as { billId?: string; note?: string };

    if (!billId) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin: billId',
      });
    }

    // Tìm bill để lấy appointmentID và số tiền
    const bill = await Bill.findById(billId).session(session);
    if (!bill) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hoá đơn',
      });
    }

    const appointmentId = bill.appointmentID as unknown as string;
    const amount = bill.totalAmount;

    // Tạo payment record
    const payment = await Payment.create(
      [
        {
          appointmentID: new mongoose.Types.ObjectId(appointmentId),
          billID: bill._id,
          amount,
          paymentMethod: 'CASH',
          status: 'completed',
          note,
          completedAt: new Date(),
        },
      ],
      { session }
    );

    // Update appointment status to completed (nếu tồn tại)
    const appointment = await Appointment.findById(appointmentId).session(session);
    if (appointment) {
      appointment.status = 'completed';
      await appointment.save({ session });
    }

    await session.commitTransaction();
    return res.status(200).json({
      success: true,
      message: 'Thanh toán tiền mặt thành công',
      data: payment[0],
    });
  } catch (error: any) {
    await session.abortTransaction();
    console.error('Error confirming cash payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi xác nhận thanh toán',
    });
  } finally {
    session.endSession();
  }
}

// Xác nhận payment từ PayOS callback
export async function confirmPayOSPayment(req: Request, res: Response) {
  try {
    const { paymentLinkId } = req.params;

    if (!paymentLinkId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu paymentLinkId',
      });
    }

    // Tìm payment
    const payment = await Payment.findOne({ paymentLinkId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy payment',
      });
    }

    // Kiểm tra payment link status từ PayOS
    try {
      const response = await fetch(`${PAYOS_BASE_URL}/v2/payment-requests/${paymentLinkId}`, {
        method: 'GET',
        headers: {
          'x-client-id': PAYOS_CLIENT_ID,
          'x-api-key': PAYOS_API_KEY,
        },
      });

      const payOSResult = await response.json();

      if (payOSResult.code === 0 && payOSResult.data) {
        const paymentData = payOSResult.data;

        // Kiểm tra trạng thái thanh toán
        if (paymentData.status === 'PAID') {
          payment.status = 'completed';
          payment.completedAt = new Date();
          payment.payOSData = {
            code: payOSResult.code.toString(),
            desc: payOSResult.desc || 'Success',
            data: paymentData,
          };
          await payment.save();

          // Update appointment status
          const appointment = await Appointment.findById(payment.appointmentID);
          if (appointment) {
            appointment.status = 'completed';
            await appointment.save();
          }

          return res.status(200).json({
            success: true,
            message: 'Thanh toán thành công',
            data: payment,
          });
        } else {
          return res.status(200).json({
            success: false,
            message: `Payment chưa được thanh toán. Status: ${paymentData.status}`,
            data: payment,
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: payOSResult.desc || 'Không thể kiểm tra trạng thái payment',
        });
      }
    } catch (error: any) {
      console.error('Error checking PayOS status:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi kiểm tra trạng thái payment',
      });
    }
  } catch (error: any) {
    console.error('Error confirming PayOS payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi xác nhận payment',
    });
  }
}

// Lấy trạng thái payment
export async function getPaymentStatus(req: Request, res: Response) {
  try {
    const { paymentLinkId } = req.params;

    if (!paymentLinkId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu paymentLinkId',
      });
    }

    const payment = await Payment.findOne({ paymentLinkId }).populate('appointmentID');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy payment',
      });
    }

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error: any) {
    console.error('Error getting payment status:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy trạng thái payment',
    });
  }
}

// Webhook handler cho PayOS (nếu cần)
export async function handlePayOSWebhook(req: Request, res: Response) {
  try {
    const webhookData = req.body;

    // Verify webhook signature (nếu PayOS hỗ trợ)
    // const signature = req.headers['x-payos-signature'];
    // if (!verifyPayOSSignature(webhookData, signature)) {
    //   return res.status(401).json({ success: false, message: 'Invalid signature' });
    // }

    const { code, data } = webhookData;

    if (code === 0 && data) {
      const paymentLinkId = data.paymentLinkId || data.orderCode?.toString();

      if (paymentLinkId) {
        const payment = await Payment.findOne({ paymentLinkId });

        if (payment) {
          if (data.status === 'PAID') {
            payment.status = 'completed';
            payment.completedAt = new Date();
            payment.payOSData = {
              code: code.toString(),
              desc: webhookData.desc || 'Success',
              data: data,
            };
            await payment.save();

            // Update appointment
            const appointment = await Appointment.findById(payment.appointmentID);
            if (appointment) {
              appointment.status = 'completed';
              await appointment.save();
            }
          }
        }
      }
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error handling PayOS webhook:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi xử lý webhook',
    });
  }
}

