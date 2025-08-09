import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function FeeManagement() {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [feeDetails, setFeeDetails] = useState({ total_fees: 0, payments: [] });
    const [loading, setLoading] = useState(true);

    const [newTotalFees, setNewTotalFees] = useState('');
    const [newPaymentAmount, setNewPaymentAmount] = useState('');
    const [newPaymentDate, setNewPaymentDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchFeeData = useCallback(async (year) => {
        if (!student) return;
        const academicYear = year || student.academic_year || new Date().getFullYear().toString();
        const data = await window.db.getStudentFeeDetails({
            studentId: student.id,
            academicYear: academicYear
        });
        setFeeDetails(data);
        setNewTotalFees(data.total_fees || '');
    }, [student]);

    useEffect(() => {
        const fetchStudent = async () => {
            const studentData = await window.db.getStudentById(parseInt(studentId));
            setStudent(studentData);
            setLoading(false);
        };
        fetchStudent();
    }, [studentId]);

    useEffect(() => {
        if (student) {
            fetchFeeData();
        }
    }, [student, fetchFeeData]);

    const totalPaid = useMemo(() => {
        return feeDetails.payments.reduce((acc, p) => acc + parseFloat(p.amount), 0);
    }, [feeDetails.payments]);

    const remainingBalance = useMemo(() => {
        return feeDetails.total_fees - totalPaid;
    }, [feeDetails.total_fees, totalPaid]);

    const handleSetTotalFees = async (e) => {
        e.preventDefault();
        if (!newTotalFees || !student) return;
        const academicYear = student.academic_year || new Date().getFullYear().toString();
        await window.db.setTotalFee({
            studentId: student.id,
            academicYear: academicYear,
            totalFees: parseFloat(newTotalFees),
        });
        fetchFeeData(academicYear);
    };

    const handleAddPayment = async (e) => {
        e.preventDefault();
        if (!newPaymentAmount || !newPaymentDate || !student) return;
        const academicYear = student.academic_year || new Date().getFullYear().toString();
        const result = await window.db.addPayment({
            studentId: student.id,
            academicYear: academicYear,
            amount: parseFloat(newPaymentAmount),
            date: newPaymentDate,
        });

        setNewPaymentAmount('');
        fetchFeeData();

        if (result && result[0]) {
            const newPaymentId = result[0];
            navigate(`/students/${student.id}/receipt/${newPaymentId}`);
        } else {
            alert('تم تسجيل الدفعة بنجاح، ولكن حدث خطأ أثناء إنشاء الإيصال.');
        }
    };

    if (loading) {
        return <div className="container">جاري تحميل البيانات...</div>;
    }

    if (!student) {
        return <div className="container">لم يتم العثور على الطالب.</div>;
    }

    return (
        <div className="container">
            <div className="page-header">
                <h2>إدارة الرسوم الدراسية للطالب: {student.name}</h2>
                <button onClick={() => navigate('/students')} className="secondary">&larr; العودة إلى الطلاب</button>
            </div>
            <p><strong>العام الدراسي:</strong> {student.academic_year || 'غير محدد'}</p>

            <div className="fee-summary">
                <div>
                    <h4>إجمالي الرسوم</h4>
                    <p>{feeDetails.total_fees.toFixed(2)}</p>
                </div>
                <div>
                    <h4>المبلغ المدفوع</h4>
                    <p>{totalPaid.toFixed(2)}</p>
                </div>
                <div>
                    <h4>الرصيد المتبقي</h4>
                    <p className={remainingBalance <= 0 ? 'success' : 'danger'}>{remainingBalance.toFixed(2)}</p>
                </div>
            </div>

            <div className="fee-actions">
                <form onSubmit={handleSetTotalFees} className="form-inline">
                    <h3>تحديد الرسوم الإجمالية</h3>
                    <div className="form-group">
                        <label htmlFor="total-fees">إجمالي الرسوم للعام الدراسي</label>
                        <input
                            id="total-fees"
                            type="number"
                            value={newTotalFees}
                            onChange={e => setNewTotalFees(e.target.value)}
                            placeholder="e.g., 5000"
                            required
                        />
                    </div>
                    <button type="submit">حفظ المبلغ الإجمالي</button>
                </form>

                <form onSubmit={handleAddPayment} className="form-inline">
                    <h3>تسجيل دفعة جديدة</h3>
                    <div className="form-group">
                        <label htmlFor="payment-amount">المبلغ</label>
                        <input
                            id="payment-amount"
                            type="number"
                            value={newPaymentAmount}
                            onChange={e => setNewPaymentAmount(e.target.value)}
                            placeholder="e.g., 1000"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="payment-date">التاريخ</label>
                        <input
                            id="payment-date"
                            type="date"
                            value={newPaymentDate}
                            onChange={e => setNewPaymentDate(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">إضافة دفعة</button>
                </form>
            </div>

            <h3>سجل الدفعات</h3>
            <table>
                <thead>
                    <tr>
                        <th>التاريخ</th>
                        <th>المبلغ المدفوع</th>
                    </tr>
                </thead>
                <tbody>
                    {feeDetails.payments.length > 0 ? feeDetails.payments.map(p => (
                        <tr key={p.id}>
                            <td>{p.date}</td>
                            <td>{parseFloat(p.amount).toFixed(2)}</td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="2" style={{textAlign: 'center'}}>لا توجد دفعات مسجلة.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default FeeManagement;
