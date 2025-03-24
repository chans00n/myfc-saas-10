'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const userData = {
  totalUsers: 1245,
  activeUsers: 892,
  premiumUsers: 378,
  freeUsers: 867,
  newUsersThisMonth: 124,
  usersByPlan: [
    { name: 'Free', value: 867 },
    { name: 'Basic', value: 243 },
    { name: 'Pro', value: 98 },
    { name: 'Enterprise', value: 37 }
  ],
  usersByMonth: [
    { name: 'Jan', users: 600 },
    { name: 'Feb', users: 650 },
    { name: 'Mar', users: 780 },
    { name: 'Apr', users: 820 },
    { name: 'May', users: 900 },
    { name: 'Jun', users: 950 },
    { name: 'Jul', users: 1050 },
    { name: 'Aug', users: 1100 },
    { name: 'Sep', users: 1150 },
    { name: 'Oct', users: 1200 },
    { name: 'Nov', users: 1220 },
    { name: 'Dec', users: 1245 },
  ],
  usersByLocation: [
    { name: 'North America', users: 610 },
    { name: 'Europe', users: 420 },
    { name: 'Asia', users: 95 },
    { name: 'South America', users: 65 },
    { name: 'Africa', users: 35 },
    { name: 'Oceania', users: 20 },
  ]
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function UserStatsOverview() {
  return (
    <div className="space-y-8">
      {/* Key stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Users" 
          value={userData.totalUsers.toString()} 
          description="All registered users"
          trend="+10% from last month"
          trendUp={true}
        />
        <StatCard 
          title="Active Users" 
          value={userData.activeUsers.toString()} 
          description="Users active in last 30 days"
          trend="+5% from last month"
          trendUp={true}
        />
        <StatCard 
          title="Premium Users" 
          value={userData.premiumUsers.toString()} 
          description="Users on paid plans"
          trend="+15% from last month"
          trendUp={true}
        />
        <StatCard 
          title="New Users" 
          value={userData.newUsersThisMonth.toString()} 
          description="New signups this month"
          trend="-3% from last month"
          trendUp={false}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1">
        {/* User Growth Chart */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm">
          <h3 className="text-lg font-medium mb-4 text-neutral-900 dark:text-neutral-50">User Growth</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={userData.usersByMonth}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#525252" opacity={0.1} />
                <XAxis dataKey="name" stroke="#737373" />
                <YAxis stroke="#737373" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f5f5f5', 
                    color: '#171717',
                    borderRadius: '0.375rem',
                    border: '1px solid #e5e5e5'
                  }} 
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  name="Users"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

type StatCardProps = {
  title: string;
  value: string;
  description: string;
  trend: string;
  trendUp: boolean;
};

function StatCard({ title, value, description, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm">
      <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{title}</h3>
      <p className="text-3xl font-bold mt-2 text-neutral-900 dark:text-neutral-50">{value}</p>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{description}</p>
      <p className={`text-xs mt-2 ${trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {trend}
      </p>
    </div>
  );
} 