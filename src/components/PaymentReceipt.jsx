import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function PaymentReceipt() {
    const { studentId, paymentId } = useParams();
    const navigate = useNavigate();
    const [receiptData, setReceiptData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app, you'd fetch the specific payment and student details here.
        // For now, we'll just simulate the data that would be passed to this page.
        // The actual data fetching logic would be more complex.
        const fetchReceiptData = async () => {
            // This is a placeholder for the more complex logic that would be needed.
            // We would need a `get-payment-by-id` and `get-student-fee-details`
            // and then combine them to generate the receipt view.

            // Simulating data for now.
            const student = await window.db.getStudentById(parseInt(studentId));
            const schoolName = await window.db.getSetting('schoolName');
            const schoolLogo = await window.db.getLogo();

            // This is a simplified simulation. A real implementation would need to
            // get the state of the balance *at the time of the payment*.
            setReceiptData({
                studentName: student.name,
                schoolName,
                schoolLogo,
                payment: { id: paymentId, amount: 1000, date: new Date().toLocaleDateString() }, // simulated
                totalFees: 5000, // simulated
                remainingBalance: 4000, // simulated
            });
            setLoading(false);
        };
        fetchReceiptData();
    }, [studentId, paymentId]);


    if (loading) {
        return <div className="container">جاري تحميل الإيصال...</div>;
    }

    if (!receiptData) {
        return <div className="container">لا يمكن العثور على بيانات الإيصال.</div>;
    }

    return (
        <div className="container">
            <div className="page-header no-print">
                <h2>إيصال الدفع</h2>
                <div className="actions">
                    <button onClick={() => navigate(`/students/${studentId}/fees`)} className="secondary">&larr; العودة إلى الرسوم</button>
                    <button onClick={() => window.print()}>طباعة الإيصال</button>
                </div>
            </div>

            <div id="print-area" className="receipt">
                <header className="receipt-header">
                    {receiptData.schoolLogo && <img src={receiptData.schoolLogo} alt="School Logo" />}
                    <h1>{receiptData.schoolName}</h1>
                    <h2>إيصال استلام رسوم دراسية</h2>
                </header>
                <section className="receipt-body">
                    <p><strong>اسم الطالب:</strong> {receiptData.studentName}</p>
                    <p><strong>تاريخ الدفع:</strong> {receiptData.payment.date}</p>
                    <hr />
                    <p><strong>المبلغ المدفوع:</strong> {receiptData.payment.amount.toFixed(2)}</p>
                    <hr />
                    <p><strong>إجمالي الرسوم:</strong> {receiptData.totalFees.toFixed(2)}</p>
                    <p><strong>الرصيد المتبقي:</strong> {receiptData.remainingBalance.toFixed(2)}</p>
                </section>
                <footer className="receipt-footer">
                    <p>شكراً لكم!</p>
                </footer>
            </div>
        </div>
    );
}

export default PaymentReceipt;
