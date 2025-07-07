export const generateOrderId = (existingOrders: any[]): string => {
  const currentYear = new Date().getFullYear();
  const yearPrefix = `SP/${currentYear}/`;
  
  // Find the highest order number for the current year
  const currentYearOrders = existingOrders.filter(order => 
    order.orderId.startsWith(yearPrefix)
  );
  
  let maxNumber = 0;
  currentYearOrders.forEach(order => {
    const orderNumber = parseInt(order.orderId.split('/')[2]);
    if (orderNumber > maxNumber) {
      maxNumber = orderNumber;
    }
  });
  
  const nextNumber = maxNumber + 1;
  return `${yearPrefix}${String(nextNumber).padStart(4, '0')}`;
};

export const getOrderStatusAction = (status: string): string => {
  const actions = {
    'pending-approval': 'is pending approval',
    'sticker-printing': 'moved to sticker printing',
    'sample-approval': 'moved to sample approval',
    'under-fusing': 'moved to fusing',
    'under-packaging': 'moved to packaging',
    'ready-to-ship': 'is ready to ship',
    'dispatched': 'was dispatched',
    'cancelled': 'was cancelled'
  };
  return actions[status as keyof typeof actions] || 'was updated';
};

export const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return '1 day ago';
  return `${diffInDays} days ago`;
};