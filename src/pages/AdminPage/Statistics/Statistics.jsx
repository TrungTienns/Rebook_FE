
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import './Statistics.scss';

export default function Statistics() {
  // Mock Data cho biểu đồ cột (Người dùng đăng ký theo tháng)
  const monthlyData = [
    { name: 'Tháng 1', users: 120, revenue: 1500 },
    { name: 'Tháng 2', users: 200, revenue: 2300 },
    { name: 'Tháng 3', users: 150, revenue: 1800 },
    { name: 'Tháng 4', users: 280, revenue: 3200 },
    { name: 'Tháng 5', users: 320, revenue: 3900 },
    { name: 'Tháng 6', users: 400, revenue: 4500 },
  ];

  // Mock Data cho biểu đồ tròn (Thể loại sách được đọc nhiều nhất)
  const categoryData = [
    { name: 'Tiểu thuyết', value: 400 },
    { name: 'Khoa học', value: 300 },
    { name: 'Lịch sử', value: 300 },
    { name: 'Kinh doanh', value: 200 },
  ];
  const COLORS = ['#ff5722', '#2196F3', '#FFC107', '#4CAF50'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="admin-statistics-container">
      <div className="admin-header">
        <h2>Thống Kê Chi Tiết</h2>
      </div>

      {/* AI Summary Section */}
      <motion.div 
        className="ai-summary-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="ai-header">
          <i className="fa-solid fa-robot ai-icon"></i>
          <h3>AI Analyst Summary</h3>
        </div>
        <div className="ai-content">
          <div className="placeholder-text">
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            Hệ thống AI phân tích đang được tích hợp. Tại đây, AI sẽ đưa ra các báo cáo tóm lược về sở thích, hành vi người dùng và dự đoán xu hướng đọc sách trong tương lai dựa trên dữ liệu thống kê...
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="stats-charts-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ marginTop: '2rem' }}
      >
        {/* Chart 1 */}
        <motion.div className="chart-card" variants={itemVariants}>
          <div className="chart-header">
            <h3>Tăng trưởng người dùng & Doanh thu (2026)</h3>
            <div className="chart-icon"><i className="fa-solid fa-chart-bar"></i></div>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis dataKey="name" tick={{fontFamily: 'Fredoka'}} />
                <YAxis yAxisId="left" tick={{fontFamily: 'Fredoka'}} />
                <YAxis yAxisId="right" orientation="right" tick={{fontFamily: 'Fredoka'}} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '2px solid #000', fontWeight: '700' }} />
                <Legend wrapperStyle={{ fontFamily: 'Fredoka', fontWeight: '600' }} />
                <Bar yAxisId="left" dataKey="users" name="Người dùng mới" fill="#ffd700" stroke="#000" strokeWidth={2} radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="revenue" name="Doanh thu ($)" fill="#00e676" stroke="#000" strokeWidth={2} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Chart 2 */}
        <motion.div className="chart-card" variants={itemVariants}>
          <div className="chart-header">
            <h3>Tỷ lệ thể loại sách được đọc</h3>
            <div className="chart-icon"><i className="fa-solid fa-chart-pie"></i></div>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#000"
                  strokeWidth={2}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '2px solid #000', fontWeight: '700' }} />
                <Legend wrapperStyle={{ fontFamily: 'Fredoka', fontWeight: '600' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Chart 3 */}
        <motion.div className="chart-card" variants={itemVariants} style={{ gridColumn: '1 / -1' }}>
          <div className="chart-header">
            <h3>Lưu lượng truy cập hàng ngày (Daily Active Users)</h3>
            <div className="chart-icon"><i className="fa-solid fa-chart-line"></i></div>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis dataKey="name" tick={{fontFamily: 'Fredoka'}} />
                <YAxis tick={{fontFamily: 'Fredoka'}} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '2px solid #000', fontWeight: '700' }} />
                <Legend wrapperStyle={{ fontFamily: 'Fredoka', fontWeight: '600' }} />
                <Line type="monotone" dataKey="users" name="DAU" stroke="#ff5722" strokeWidth={4} activeDot={{ r: 8, stroke: '#000', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
