export default function DashboardStats({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[
        { 
          title: "Total Products", 
          value: stats.totalProducts, 
          icon: "🌱", 
          color: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" 
        },
        { 
          title: "Out of Stock", 
          value: stats.outOfStock, 
          icon: "⚠️", 
          color: "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200" 
        },
        { 
          title: "Total Sold", 
          value: stats.totalSales, 
          icon: "💰", 
          color: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200" 
        },
        { 
          title: "Avg Rating", 
          value: stats.averageRating || 0, 
          icon: "⭐", 
          color: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200" 
        }
      ].map((stat, index) => (
        <div 
          key={index} 
          className={`p-6 rounded-xl ${stat.color} shadow-sm hover:shadow-md transition-all duration-200`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{stat.title}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
            <span className="text-3xl">{stat.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}