// Date Helper Utilities
// Functions for formatting dates and times in chat contexts

export const formatMessageTime = (date: Date): string => {
  const now = new Date();
  const messageDate = new Date(date);
  const diffInMs = now.getTime() - messageDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Same day
  if (diffInDays === 0) {
    if (diffInMinutes < 1) {
      return 'now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else {
      return messageDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
  }
  
  // Yesterday
  if (diffInDays === 1) {
    return 'yesterday';
  }
  
  // This week
  if (diffInDays < 7) {
    return messageDate.toLocaleDateString('en-US', { weekday: 'short' });
  }
  
  // This year
  if (messageDate.getFullYear() === now.getFullYear()) {
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
  
  // Different year
  return messageDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatChatTime = (date: Date): string => {
  const now = new Date();
  const chatDate = new Date(date);
  const diffInMs = now.getTime() - chatDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Same day
  if (diffInDays === 0) {
    if (diffInMinutes < 1) {
      return 'now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours === 1) {
      return '1 hour ago';
    } else {
      return `${diffInHours} hours ago`;
    }
  }
  
  // Yesterday
  if (diffInDays === 1) {
    return 'yesterday';
  }
  
  // This week
  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }
  
  // This month
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  
  // This year
  if (chatDate.getFullYear() === now.getFullYear()) {
    const months = Math.floor(diffInDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
  
  // Different year
  const years = now.getFullYear() - chatDate.getFullYear();
  return years === 1 ? '1 year ago' : `${years} years ago`;
};

export const formatLastSeen = (date: Date): string => {
  const now = new Date();
  const lastSeenDate = new Date(date);
  const diffInMs = now.getTime() - lastSeenDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Same day
  if (diffInDays === 0) {
    if (diffInMinutes < 1) {
      return 'active now';
    } else if (diffInMinutes < 60) {
      return `last seen ${diffInMinutes} minutes ago`;
    } else if (diffInHours === 1) {
      return 'last seen 1 hour ago';
    } else {
      return `last seen ${diffInHours} hours ago`;
    }
  }
  
  // Yesterday
  if (diffInDays === 1) {
    return 'last seen yesterday';
  }
  
  // This week
  if (diffInDays < 7) {
    return `last seen ${diffInDays} days ago`;
  }
  
  // Longer ago
  return `last seen ${lastSeenDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: lastSeenDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })}`;
};

export const formatFullDateTime = (date: Date): string => {
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatDateSeparator = (date: Date): string => {
  const now = new Date();
  const messageDate = new Date(date);

  // Normalize dates to midnight for accurate day comparison
  const toMidnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  
  const todayMidnight = toMidnight(now);
  const messageMidnight = toMidnight(messageDate);
  
  const diffInMs = todayMidnight.getTime() - messageMidnight.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return messageDate.toLocaleDateString('en-US', { weekday: 'long' });
  } else if (messageDate.getFullYear() === now.getFullYear()) {
    return messageDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
  } else {
    return messageDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const shouldShowDateSeparator = (currentMessage: Date, previousMessage?: Date): boolean => {
  if (!previousMessage) return true;
  return !isSameDay(currentMessage, previousMessage);
};
