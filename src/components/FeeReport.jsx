import React, { useState, useEffect, useMemo } from 'react';

function FeeReport() {
    const [summary, setSummary] = useState([]);
    const [classes, setClasses] = useState([]);
    const [classFilter, setClassFilter] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const summaryData = await window.db.getAllStudentFeeSummary();
            const classData = await window.db.getClasses();
            setSummary(summaryData);
            setClasses(classData);
            setLoading(false);
        };
        fetchData();
    }, []);

    const filteredSummary = useMemo(() => {
        if (!classFilter) {
            return summary;
        }
        return summary.filter(s => s.class_id == classFilter);
    }, [summary, classFilter]);

    const handleExportPdf = async () => {
        const result = await window.db.exportFeeReportToPdf(filteredSummary);
        if (result.success) {
            alert(`تم حفظ التقرير بنجاح في: ${result.path}`);
        } else {
            alert(`حدث خطأ أثناء تصدير التقرير: ${result.error || result.message}`);
        }
    };

    if (loading) {
        return <div className="container">جاري تحميل التقرير...</div>;
    }

    return (
        <div className="container">
            <div className="page-header">
                <h2>تقرير الرسوم الدراسية</h2>
                <div className="actions">
                    <select value={classFilter} onChange={e => setClassFilter(e.target.value)}>
                        <option value="">كل الفصول</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button onClick={handleExportPdf} className="secondary">تصدير PDF</button>
                </div>
            </div>

            <div id="print-area">
                <table>
                    <thead>
                        <tr>
                            <th>اسم الطالب</th>
                            <th>الفصل</th>
                            <th>إجمالي الرسوم</th>
                            <th>المبلغ المدفوع</th>
                            <th>الرصيد المتبقي</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSummary.map(s => (
                            <tr key={s.id}>
                                <td>{s.name}</td>
                                <td>{s.class_name || '-'}</td>
                                <td>{s.total_fees.toFixed(2)}</td>
                                <td>{s.total_paid.toFixed(2)}</td>
                                <td className={s.remaining_balance <= 0 ? 'success' : 'danger'}>
                                    {s.remaining_balance.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default FeeReport;
