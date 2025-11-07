import { Request, Response } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { Payment } from '../models/Payment.js';
import { Appointment } from '../models/Appointment.js';
import { Bill } from '../models/Bill.js';
import { Part } from '../models/Part.js';
import { decreaseInventoryByPartId } from './inventoryController.js';

// PayOS SDK - Cần cài đặt: npm install @payos/node
// import { PayOS } from '@payos/node';

// Tạm thời dùng fetch để gọi PayOS API trực tiếp
// Trong production, nên dùng PayOS SDK

const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID || '';
const PAYOS_API_KEY = process.env.PAYOS_API_KEY || '';
const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY || '';
const PAYOS_BASE_URL = process.env.PAYOS_BASE_URL || 'https://api-merchant.payos.vn';
const BACKEND_WEBHOOK_URL = process.env.BACKEND_WEBHOOK_URL || ''; // URL cho webhook (tunnel URL khi chạy local)

function generatePayOSSignature(payload: {
  amount: number;
  cancelUrl: string;
  description: string;
  orderCode: number;
  returnUrl: string;
}): string {
  const { amount, cancelUrl, description, orderCode, returnUrl } = payload;
  // Theo tài liệu payOS: sort theo alphabet các field: amount, cancelUrl, description, orderCode, returnUrl
  const dataToSign = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
  if (!PAYOS_CHECKSUM_KEY) {
    console.error('❌ PAYOS_CHECKSUM_KEY is missing. Cannot generate signature.');
  }
  console.log('🔏 PayOS dataToSign:', dataToSign);
  const hmac = crypto.createHmac('sha256', PAYOS_CHECKSUM_KEY);
  hmac.update(dataToSign);
  return hmac.digest('hex');
}

// Helper function để tạo PayOS payment link
async function createPayOSLink(data: {
  orderCode: number;
  amount: number;
  description: string;
  items: Array<{ name: string; quantity: number; price: number }>; // PayOS yêu cầu items (bắt buộc)
  returnUrl: string;
  cancelUrl: string;
  signature: string;
}) { 
  try {
    console.log('🌐 Calling PayOS API...');
    console.log('- URL:', `${PAYOS_BASE_URL}/v2/payment-requests`);
    console.log('- Method: POST');
    console.log('- Headers:', {
      'Content-Type': 'application/json',
      'x-client-id': PAYOS_CLIENT_ID ? '***SET***' : '***MISSING***',
      'x-api-key': PAYOS_API_KEY ? '***SET***' : '***MISSING***',
    });
    console.log('- Body:', JSON.stringify({ ...data, signature: '***REDACTED***' }, null, 2));
    
    const response = await fetch(`${PAYOS_BASE_URL}/v2/payment-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': PAYOS_CLIENT_ID,
        'x-api-key': PAYOS_API_KEY,
      },
      body: JSON.stringify(data),
    });

    console.log('📥 PayOS HTTP Response:');
    console.log('- Status:', response.status, response.statusText);
    console.log('- Status OK:', response.ok);
    console.log('- Headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    console.log('- Response Body:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error: any) {
    console.error('❌ PayOS API Error:');
    console.error('- Error name:', error?.name);
    console.error('- Error message:', error?.message);
    console.error('- Error stack:', error?.stack);
    throw error;
  }
}

// Tạo payment link PayOS
export async function createPayOSPayment(req: Request, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Log request body chi tiết
    console.log('=== PAYOS PAYMENT REQUEST ===');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    
    const { appointmentId, amount, description, returnUrl, cancelUrl, note, items, subtotal, tax, totalAmount } = req.body;

    // Log từng field
    console.log('Parsed Fields:');
    console.log('- appointmentId:', appointmentId, typeof appointmentId);
    console.log('- amount:', amount, typeof amount);
    console.log('- description:', description, typeof description);
    console.log('- returnUrl:', returnUrl, typeof returnUrl);
    console.log('- cancelUrl:', cancelUrl, typeof cancelUrl);
    console.log('- note:', note);
    console.log('- items:', JSON.stringify(items, null, 2));
    console.log('- subtotal:', subtotal);
    console.log('- tax:', tax);
    console.log('- totalAmount:', totalAmount);

    if (!appointmentId || !amount || !description || !returnUrl || !cancelUrl) {
      const missingFields = [];
      if (!appointmentId) missingFields.push('appointmentId');
      if (!amount) missingFields.push('amount');
      if (!description) missingFields.push('description');
      if (!returnUrl) missingFields.push('returnUrl');
      if (!cancelUrl) missingFields.push('cancelUrl');
      
      console.log('❌ Missing required fields:', missingFields);
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Thiếu thông tin bắt buộc: ${missingFields.join(', ')}`,
      });
    }

    // Validate appointment
    console.log('🔍 Validating appointment:', appointmentId);
    const appointment = await Appointment.findById(appointmentId).session(session);
    if (!appointment) {
      console.log('❌ Appointment not found:', appointmentId);
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch hẹn',
      });
    }
    console.log('✅ Appointment found:', appointment._id);

    // Validate amount
    console.log('🔍 Validating amount:', amount, 'Type:', typeof amount);
    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      console.log('❌ Invalid amount:', amount, 'Parsed:', amountNum);
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Số tiền phải lớn hơn 0. Nhận được: ${amount} (${typeof amount})`,
      });
    }
    console.log('✅ Amount valid:', amountNum);

    // Tạo Bill trước để có billNumber, sau đó dùng billNumber để tạo orderCode
    // PayOS yêu cầu orderCode là số nguyên dương, unique, <= 9 digits

    // Tạo Bill nếu có items hoặc thông tin bill
    let billId: mongoose.Types.ObjectId | undefined;
    console.log('🔍 Checking items:', items ? `Array with ${items.length} items` : 'No items');
    
    if (items && Array.isArray(items) && items.length > 0) {
      try {
        console.log('📦 Creating Bill with items...');
        // Validate và populate thông tin Part từ database
        const billItems: any[] = [];
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          console.log(`\n🔍 Validating item ${i + 1}:`, JSON.stringify(item, null, 2));
          
          // Chỉ cần partID và quantity từ frontend
          if (!item.partID) {
            console.log(`❌ Item ${i + 1}: Missing partID`);
            await session.abortTransaction();
            return res.status(400).json({
              success: false,
              message: `items[${i}].partID là bắt buộc`,
            });
          }
          
          if (!mongoose.Types.ObjectId.isValid(item.partID)) {
            console.log(`❌ Item ${i + 1}: Invalid partID format:`, item.partID);
            await session.abortTransaction();
            return res.status(400).json({
              success: false,
              message: `items[${i}].partID không hợp lệ: ${item.partID}`,
            });
          }
          
          const quantityNum = Number(item.quantity);
          if (isNaN(quantityNum) || quantityNum < 1) {
            console.log(`❌ Item ${i + 1}: Invalid quantity:`, item.quantity, 'Type:', typeof item.quantity);
            await session.abortTransaction();
            return res.status(400).json({
              success: false,
              message: `items[${i}].quantity phải >= 1. Nhận được: ${item.quantity} (${typeof item.quantity})`,
            });
          }
          console.log(`✅ Item ${i + 1}: partID và quantity hợp lệ`);

          // Lấy thông tin Part từ database
          console.log(`🔍 Fetching Part from DB: ${item.partID}`);
          const part = await Part.findById(item.partID).session(session);
          if (!part) {
            console.log(`❌ Part not found: ${item.partID}`);
            await session.abortTransaction();
            return res.status(404).json({
              success: false,
              message: `Không tìm thấy linh kiện với ID: ${item.partID}`,
            });
          }
          console.log(`✅ Part found: ${part.name}, Price: ${part.price}, PartNumber: ${part.partNumber || 'N/A'}`);

          // Tính toán lineTotal từ price và quantity
          const unitPrice = part.price;
          const quantity = quantityNum;
          const lineTotal = unitPrice * quantity;
          console.log(`📊 Item ${i + 1} calculation: ${unitPrice} × ${quantity} = ${lineTotal}`);

          billItems.push({
            partID: part._id,
            inventoryID: item.inventoryID ? new mongoose.Types.ObjectId(item.inventoryID) : undefined,
            partName: part.name,
            partNumber: part.partNumber || part._id.toString(), // Dùng partNumber hoặc partID làm fallback
            unitPrice: unitPrice,
            quantity: quantity,
            lineTotal: lineTotal,
          });
        }
        console.log(`✅ All ${billItems.length} items validated successfully`);

        const generatedNumber = `BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const issue = new Date();
        const due = new Date(issue.getTime() + 7 * 24 * 60 * 60 * 1000);
        const computedSubtotal = subtotal !== undefined ? Number(subtotal) : amountNum;
        const taxValue = tax !== undefined ? Number(tax) : 0;
        const computedTotal = totalAmount !== undefined ? Number(totalAmount) : amountNum;
        
        console.log('📄 Creating Bill with:');
        console.log('- billNumber:', generatedNumber);
        console.log('- subtotal:', computedSubtotal);
        console.log('- tax:', taxValue);
        console.log('- totalAmount:', computedTotal);
        console.log('- items count:', billItems.length);

        const bill = await Bill.create([{
          appointmentID: new mongoose.Types.ObjectId(appointmentId),
          billNumber: generatedNumber,
          issueDate: issue,
          dueDate: due,
          items: billItems,
          subtotal: computedSubtotal,
          tax: taxValue,
          totalAmount: computedTotal,
          status: 'pending',
          description: note || description, // Lưu note/description vào Bill
        }], { session });

        billId = bill[0]._id;
        console.log('✅ Bill created successfully:', billId?.toString());
        console.log('- billNumber:', bill[0].billNumber);
        console.log('- totalAmount:', bill[0].totalAmount);
        console.log('- description:', bill[0].description || 'N/A');
      } catch (billError: any) {
        await session.abortTransaction();
        console.error('❌ Error creating bill for PayOS payment:');
        console.error('- Error message:', billError?.message);
        console.error('- Error stack:', billError?.stack);
        console.error('- Error errors:', JSON.stringify(billError?.errors, null, 2));
        console.error('- Full error:', JSON.stringify(billError, null, 2));
        
        // Trả về lỗi rõ ràng hơn
        const errorMessage = billError?.message || (billError?.errors ? JSON.stringify(billError.errors) : 'Lỗi khi tạo hoá đơn');
        return res.status(400).json({
          success: false,
          message: `Thông tin truyền lên không đúng: ${errorMessage}`,
        });
      }
    } else {
      console.log('ℹ️ No items to create Bill');
    }

    // Tạo payment record
    console.log('💳 Creating Payment record...');
    const payment = await Payment.create([{
      appointmentID: new mongoose.Types.ObjectId(appointmentId),
      billID: billId,
      amount: amountNum,
      paymentMethod: 'PAYOS',
      status: 'pending',
      note,
    }], { session });
    console.log('✅ Payment created:', payment[0]._id.toString());

    // Lấy Bill để dùng billNumber và totalAmount
    let billForPayOS: any = null;
    if (billId) {
      billForPayOS = await Bill.findById(billId).session(session);
      if (!billForPayOS) {
        await session.abortTransaction();
        console.log('❌ Bill not found after creation:', billId);
        return res.status(500).json({
          success: false,
          message: 'Không tìm thấy hoá đơn sau khi tạo',
        });
      }
    }

    // Tạo orderCode từ billNumber
    // PayOS yêu cầu orderCode là số nguyên dương, unique, <= 9 digits
    // Convert billNumber (string) thành số nguyên bằng cách hash hoặc extract số
    let orderCode: number;
    if (billForPayOS && billForPayOS.billNumber) {
      // Extract số từ billNumber (ví dụ: "BILL-1762373574672-382" -> 1762373574672382)
      // Nhưng chỉ lấy <= 9 digits
      const billNumberDigits = billForPayOS.billNumber.replace(/\D/g, ''); // Lấy tất cả số
      const billNumberHash = parseInt(billNumberDigits.slice(-9) || '0', 10); // Lấy 9 số cuối
      // Combine với timestamp để đảm bảo unique
      const timestamp = Date.now();
      orderCode = Math.floor((timestamp % 100000000) + (billNumberHash % 100000000));
      // Đảm bảo không vượt quá 9 digits
      orderCode = orderCode % 1000000000;
    } else {
      // Fallback: dùng timestamp nếu không có billNumber
      orderCode = Math.floor(Date.now() % 1000000000);
    }

    // Lấy totalAmount từ Bill thay vì từ request
    const payOSAmount = billForPayOS ? Math.round(billForPayOS.totalAmount) : Math.round(amountNum);
    
    // Lấy description từ Bill hoặc từ request
    const payOSDescription = billForPayOS?.description || description || 'Thanh toán dịch vụ';

    // PayOS yêu cầu field items (bắt buộc)
    // Format: [{ name: string, quantity: number, price: number }]
    const payOSItems: Array<{ name: string; quantity: number; price: number }> = [];
    
    if (billForPayOS && billForPayOS.items && billForPayOS.items.length > 0) {
      // Lấy items từ Bill
      payOSItems.push(...billForPayOS.items.map((item: any) => ({
        name: item.partName || 'Linh kiện',
        quantity: item.quantity,
        price: Math.round(item.unitPrice), // PayOS chỉ nhận số nguyên
      })));
    } else {
      // Fallback: nếu không có items trong Bill, tạo một item tổng
      payOSItems.push({
        name: payOSDescription || 'Thanh toán dịch vụ',
        quantity: 1,
        price: payOSAmount,
      });
    }

    // Tạo PayOS payment link
    console.log('🔗 Creating PayOS payment link...');
    console.log('PayOS Request Data:');
    console.log('- orderCode:', orderCode, '(from billNumber:', billForPayOS?.billNumber, ')');
    console.log('- amount:', payOSAmount, '(from bill.totalAmount:', billForPayOS?.totalAmount, ')');
    console.log('- description:', payOSDescription, '(from bill.description:', billForPayOS?.description || 'N/A', ')');
    console.log('- items:', JSON.stringify(payOSItems, null, 2));
    console.log('- returnUrl:', returnUrl);
    console.log('- cancelUrl:', cancelUrl);
    
    // Validate envs for PayOS
    if (!PAYOS_CLIENT_ID || !PAYOS_API_KEY || !PAYOS_CHECKSUM_KEY) {
      await session.abortTransaction();
      const missing = [
        !PAYOS_CLIENT_ID ? 'PAYOS_CLIENT_ID' : null,
        !PAYOS_API_KEY ? 'PAYOS_API_KEY' : null,
        !PAYOS_CHECKSUM_KEY ? 'PAYOS_CHECKSUM_KEY' : null,
      ].filter(Boolean);
      return res.status(500).json({
        success: false,
        message: `Thiếu cấu hình PayOS: ${missing.join(', ')}`,
      });
    }

    const signature = generatePayOSSignature({
      amount: payOSAmount,
      cancelUrl: String(cancelUrl),
      description: String(payOSDescription),
      orderCode: Number(orderCode),
      returnUrl: String(returnUrl),
    });

    const payOSRequestData = {
      orderCode: orderCode,
      amount: payOSAmount,
      description: payOSDescription,
      items: payOSItems,
      returnUrl: returnUrl,
      cancelUrl: cancelUrl,
      signature,
    };
    console.log('📤 Calling PayOS API with:', JSON.stringify(payOSRequestData, null, 2));
    
    const payOSResponse = await createPayOSLink(payOSRequestData);

    console.log('📥 PayOS Response:');
    console.log('- code:', payOSResponse.code);
    console.log('- desc:', payOSResponse.desc);
    console.log('- data:', JSON.stringify(payOSResponse.data, null, 2));

    if ((payOSResponse.code === 0 || payOSResponse.code === '00') && payOSResponse.data) {
      // Update payment với paymentLinkId
      payment[0].paymentLinkId = payOSResponse.data.paymentLinkId || String(orderCode);
      payment[0].payOSData = {
        code: payOSResponse.code.toString(),
        desc: payOSResponse.desc || 'Success',
        data: payOSResponse.data,
      };
      await payment[0].save({ session });
      console.log('✅ Payment updated with paymentLinkId:', payment[0].paymentLinkId);

      await session.commitTransaction();
      console.log('✅ Transaction committed successfully');
      console.log('=== PAYOS PAYMENT SUCCESS ===\n');
      
      return res.status(200).json({
        success: true,
        message: 'Tạo payment link thành công',
        data: {
          paymentLinkId: payment[0].paymentLinkId,
          checkoutUrl: payOSResponse.data.checkoutUrl,
          qrCode: payOSResponse.data.qrCode,
          billId: billId?.toString(),
        },
      });
    } else {
      // Update payment status to failed
      payment[0].status = 'failed';
      await payment[0].save({ session });
      await session.abortTransaction();
      
      console.log('❌ PayOS returned error:');
      console.log('- code:', payOSResponse.code);
      console.log('- desc:', payOSResponse.desc);
      console.log('- Full response:', JSON.stringify(payOSResponse, null, 2));
      console.log('=== PAYOS PAYMENT FAILED ===\n');

      return res.status(400).json({
        success: false,
        message: payOSResponse.desc || `PayOS trả về lỗi với code: ${payOSResponse.code}`,
        payOSError: {
          code: payOSResponse.code,
          desc: payOSResponse.desc,
        },
      });
    }
  } catch (error: any) {
    await session.abortTransaction();
    console.error('❌ EXCEPTION in createPayOSPayment:');
    console.error('- Error name:', error?.name);
    console.error('- Error message:', error?.message);
    console.error('- Error stack:', error?.stack);
    console.error('- Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.log('=== PAYOS PAYMENT EXCEPTION ===\n');
    
    return res.status(500).json({
      success: false,
      message: `Lỗi máy chủ khi tạo payment link: ${error?.message || 'Unknown error'}`,
      error: process.env.NODE_ENV === 'development' ? error?.message : undefined,
    });
  } finally {
    session.endSession();
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

// Xác nhận payment từ PayOS callback (gọi từ frontend sau khi PayOS redirect)
export async function confirmPayOSPayment(req: Request, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { paymentLinkId } = req.params;

    console.log('=== PAYOS CALLBACK CONFIRM ===');
    console.log('paymentLinkId:', paymentLinkId);

    if (!paymentLinkId) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Thiếu paymentLinkId',
      });
    }

    // Tìm payment
    const payment = await Payment.findOne({ paymentLinkId }).session(session);
    if (!payment) {
      await session.abortTransaction();
      console.log('❌ Payment not found with paymentLinkId:', paymentLinkId);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy payment',
      });
    }

    console.log('Payment found:', payment._id);
    console.log('Current payment status:', payment.status);

    // Nếu payment đã completed, trả về luôn
    if (payment.status === 'completed') {
      await session.commitTransaction();
      console.log('ℹ️ Payment already completed');
      return res.status(200).json({
        success: true,
        message: 'Payment đã được xác nhận trước đó',
        data: payment,
      });
    }

    // Kiểm tra payment link status từ PayOS
    try {
      console.log('🔍 Checking PayOS payment status...');
      const response = await fetch(`${PAYOS_BASE_URL}/v2/payment-requests/${paymentLinkId}`, {
        method: 'GET',
        headers: {
          'x-client-id': PAYOS_CLIENT_ID,
          'x-api-key': PAYOS_API_KEY,
        },
      });

      const payOSResult = await response.json();
      console.log('PayOS API response:', JSON.stringify(payOSResult, null, 2));

      if ((payOSResult.code === 0 || payOSResult.code === '00') && payOSResult.data) {
        const paymentData = payOSResult.data;

        // Kiểm tra trạng thái thanh toán
        if (paymentData.status === 'PAID') {
          console.log('✅ Payment is PAID, updating status...');
          
          payment.status = 'completed';
          payment.completedAt = new Date();
          payment.payOSData = {
            code: payOSResult.code.toString(),
            desc: payOSResult.desc || 'Success',
            data: paymentData,
          };
          await payment.save({ session });
          console.log('✅ Payment updated to completed');

          // Update Bill status nếu có Bill
          if (payment.billID) {
            const bill = await Bill.findById(payment.billID).session(session);
            if (bill) {
              console.log('Bill status before update:', bill.status);
              if (bill.status === 'pending') {
                // Trừ kho từ Bill items nếu có
                if (bill.items && bill.items.length > 0) {
                  console.log('Decreasing inventory for', bill.items.length, 'items...');
                  for (const item of bill.items) {
                    const result = await decreaseInventoryByPartId(item.partID, item.quantity, session);
                    if (!result.success) {
                      await session.abortTransaction();
                      console.error('❌ Failed to decrease inventory:', result.message);
                      return res.status(result.message?.includes('Không tìm thấy') ? 404 : 400).json({
                        success: false,
                        message: result.message?.replace('partID này', `linh kiện: ${item.partName}`) || 'Lỗi giảm tồn kho',
                      });
                    }
                    console.log(`✅ Decreased inventory for part ${item.partID}, quantity: ${item.quantity}`);
                  }
                }
                bill.status = 'paid';
                await bill.save({ session });
                console.log('✅ Bill updated to paid');
              } else {
                console.log('ℹ️ Bill already has status:', bill.status);
              }
            }
          }

          // Update appointment status
          const appointment = await Appointment.findById(payment.appointmentID).session(session);
          if (appointment) {
            console.log('Appointment status before update:', appointment.status);
            appointment.status = 'completed';
            await appointment.save({ session });
            console.log('✅ Appointment updated to completed');
          }

          await session.commitTransaction();
          console.log('✅ Transaction committed successfully');
          console.log('=== PAYOS CALLBACK SUCCESS ===\n');
          
          // Populate billID để frontend có thể fetch bill
          const paymentResponse = payment.toObject();
          if (payment.billID) {
            paymentResponse.billID = payment.billID.toString();
          }
          
          return res.status(200).json({
            success: true,
            message: 'Thanh toán thành công',
            data: paymentResponse,
          });
        } else {
          await session.commitTransaction();
          console.log('ℹ️ Payment status is not PAID:', paymentData.status);
          return res.status(200).json({
            success: false,
            message: `Payment chưa được thanh toán. Status: ${paymentData.status}`,
            data: payment,
          });
        }
      } else {
        await session.abortTransaction();
        console.log('❌ PayOS API error:', payOSResult);
        return res.status(400).json({
          success: false,
          message: payOSResult.desc || 'Không thể kiểm tra trạng thái payment',
        });
      }
    } catch (error: any) {
      await session.abortTransaction();
      console.error('❌ Error checking PayOS status:');
      console.error('- Error name:', error?.name);
      console.error('- Error message:', error?.message);
      console.error('- Error stack:', error?.stack);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi kiểm tra trạng thái payment',
      });
    }
  } catch (error: any) {
    await session.abortTransaction();
    console.error('❌ Error confirming PayOS payment:');
    console.error('- Error name:', error?.name);
    console.error('- Error message:', error?.message);
    console.error('- Error stack:', error?.stack);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi xác nhận payment',
    });
  } finally {
    session.endSession();
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

// Webhook handler cho PayOS
export async function handlePayOSWebhook(req: Request, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    console.log('=== PAYOS WEBHOOK RECEIVED ===');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));

    const webhookData = req.body;

    // Verify webhook signature (nếu PayOS hỗ trợ)
    // const signature = req.headers['x-payos-signature'];
    // if (!verifyPayOSSignature(webhookData, signature)) {
    //   await session.abortTransaction();
    //   return res.status(401).json({ success: false, message: 'Invalid signature' });
    // }

    const { code, desc, data } = webhookData;
    console.log('Webhook parsed:');
    console.log('- code:', code);
    console.log('- desc:', desc);
    console.log('- data:', JSON.stringify(data, null, 2));

    if ((code === 0 || code === '00') && data) {
      // PayOS có thể gửi paymentLinkId hoặc orderCode
      const paymentLinkId = data.paymentLinkId?.toString() || data.paymentLinkId;
      const orderCode = data.orderCode?.toString();
      
      console.log('Looking for payment with:');
      console.log('- paymentLinkId:', paymentLinkId);
      console.log('- orderCode:', orderCode);

      // Tìm payment bằng paymentLinkId hoặc orderCode
      let payment = null;
      if (paymentLinkId) {
        payment = await Payment.findOne({ paymentLinkId }).session(session);
        console.log('Payment found by paymentLinkId:', payment ? payment._id : 'NOT FOUND');
      }
      
      if (!payment && orderCode) {
        // Nếu không tìm thấy bằng paymentLinkId, thử tìm bằng orderCode trong payOSData
        payment = await Payment.findOne({ 
          'payOSData.data.orderCode': parseInt(orderCode) 
        }).session(session);
        console.log('Payment found by orderCode:', payment ? payment._id : 'NOT FOUND');
      }

      if (payment) {
        console.log('Payment status before update:', payment.status);
        console.log('Webhook data.status:', data.status);

        // Chỉ xử lý khi status là PAID và payment chưa completed
        if (data.status === 'PAID' && payment.status !== 'completed') {
          console.log('✅ Processing PAID payment...');
          
          payment.status = 'completed';
          payment.completedAt = new Date();
          payment.payOSData = {
            code: code?.toString() || '00',
            desc: desc || 'Success',
            data: data,
          };
          await payment.save({ session });
          console.log('✅ Payment updated to completed');

          // Update Bill status nếu có Bill
          if (payment.billID) {
            const bill = await Bill.findById(payment.billID).session(session);
            if (bill) {
              console.log('Bill status before update:', bill.status);
              if (bill.status === 'pending') {
                // Trừ kho từ Bill items nếu có
                if (bill.items && bill.items.length > 0) {
                  console.log('Decreasing inventory for', bill.items.length, 'items...');
                  for (const item of bill.items) {
                    const result = await decreaseInventoryByPartId(item.partID, item.quantity, session);
                    if (!result.success) {
                      console.error(`❌ Failed to decrease inventory for part ${item.partID}:`, result.message);
                      // Vẫn tiếp tục, không abort transaction (có thể log để xử lý sau)
                    } else {
                      console.log(`✅ Decreased inventory for part ${item.partID}, quantity: ${item.quantity}`);
                    }
                  }
                }
                bill.status = 'paid';
                await bill.save({ session });
                console.log('✅ Bill updated to paid');
              } else {
                console.log('ℹ️ Bill already has status:', bill.status);
              }
            }
          }

          // Update appointment
          const appointment = await Appointment.findById(payment.appointmentID).session(session);
          if (appointment) {
            console.log('Appointment status before update:', appointment.status);
            appointment.status = 'completed';
            await appointment.save({ session });
            console.log('✅ Appointment updated to completed');
          }

          await session.commitTransaction();
          console.log('✅ Transaction committed successfully');
          console.log('=== PAYOS WEBHOOK SUCCESS ===\n');
          
          return res.status(200).json({ success: true, message: 'Webhook processed successfully' });
        } else {
          console.log('ℹ️ Payment status is not PAID or already completed:', data.status, payment.status);
          await session.commitTransaction();
          return res.status(200).json({ success: true, message: 'Payment already processed or not PAID' });
        }
      } else {
        console.log('❌ Payment not found with paymentLinkId:', paymentLinkId, 'or orderCode:', orderCode);
        await session.commitTransaction();
        return res.status(404).json({ success: false, message: 'Payment not found' });
      }
    } else {
      console.log('❌ Invalid webhook data:', { code, hasData: !!data });
      await session.commitTransaction();
      return res.status(400).json({ success: false, message: 'Invalid webhook data' });
    }
  } catch (error: any) {
    await session.abortTransaction();
    console.error('❌ Error handling PayOS webhook:');
    console.error('- Error name:', error?.name);
    console.error('- Error message:', error?.message);
    console.error('- Error stack:', error?.stack);
    console.log('=== PAYOS WEBHOOK ERROR ===\n');
    
    return res.status(500).json({
      success: false,
      message: 'Lỗi xử lý webhook',
    });
  } finally {
    session.endSession();
  }
}

