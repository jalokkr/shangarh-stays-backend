import PDFDocument from 'pdfkit';
import { IBooking } from '../models/Booking.model';
import { IRoom } from '../models/Room.model';
import { IUser } from '../models/User.model';

interface ReceiptData {
  booking: IBooking;
  room: IRoom;
  user: IUser;
}

export const generateReceiptPDF = (data: ReceiptData): PDFKit.PDFDocument => {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50
  });

  // Header
  doc.fontSize(24)
     .font('Helvetica-Bold')
     .text('The Shangarh Stays', { align: 'center' });
  
  doc.fontSize(14)
     .font('Helvetica')
     .text('Receipt', { align: 'center' });
  
  doc.moveDown(0.5);

  // Receipt details
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .text(`Receipt No: ${data.booking.bookingId}`);
  
  doc.fontSize(10)
     .font('Helvetica')
     .text(`Date: ${new Date().toLocaleDateString()}`);
  
  doc.moveDown(1);

  // Guest Information
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Guest Information');
  
  doc.fontSize(10)
     .font('Helvetica')
     .text(`Name: ${data.booking.guestDetails.name}`)
     .text(`Email: ${data.booking.guestDetails.email}`)
     .text(`Phone: ${data.booking.guestDetails.phone}`);
  
  if (data.booking.guestDetails.address) {
    doc.text(`Address: ${data.booking.guestDetails.address}`);
  }
  
  doc.moveDown(1);

  // Booking Details
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Booking Details');
  
  doc.fontSize(10)
     .font('Helvetica')
     .text(`Room: ${data.room.name}`)
     .text(`Room Type: ${data.room.roomType}`)
     .text(`Check-in: ${data.booking.checkInDate.toLocaleDateString()}`)
     .text(`Check-out: ${data.booking.checkOutDate.toLocaleDateString()}`)
     .text(`Booking Type: ${data.booking.bookingType.charAt(0).toUpperCase() + data.booking.bookingType.slice(1)}`);
  
  doc.moveDown(1);

  // Pricing Details
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Pricing Details');
  
  doc.fontSize(10)
     .font('Helvetica')
     .text(`Base Amount: ₹${data.booking.baseAmount.toFixed(2)}`)
     .text(`GST (${data.booking.gstPercentage}%): ₹${data.booking.gstAmount.toFixed(2)}`)
     .text(`Razorpay Charges: ₹${data.booking.razorpayCharges.toFixed(2)}`)
     .text(`Total Amount: ₹${data.booking.totalAmount.toFixed(2)}`);
  
  doc.moveDown(1);

  // Special Requests
  if (data.booking.specialRequests) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Special Requests');
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(data.booking.specialRequests);
    
    doc.moveDown(1);
  }

  // Terms and Conditions
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .text('Terms and Conditions');
  
  doc.fontSize(8)
     .font('Helvetica')
     .text('1. Check-in time: 2:00 PM, Check-out time: 11:00 AM')
     .text('2. Early check-in and late check-out subject to availability')
     .text('3. Cancellation policy: 24 hours prior to check-in')
     .text('4. Smoking is not allowed in rooms')
     .text('5. Pets are not allowed')
     .text('6. Please maintain cleanliness and respect the property');
  
  doc.moveDown(1);

  // Footer
  doc.fontSize(10)
     .font('Helvetica')
     .text('Thank you for choosing The Shangarh Stays!', { align: 'center' })
     .text('For any queries, please contact us at: info@shangarhstays.com', { align: 'center' });

  doc.end();
  return doc;
};
