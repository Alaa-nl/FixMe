/**
 * Convert a date to a relative time string
 * @param date - The date to convert
 * @returns A relative time string like "2 hours ago" or "3 days ago"
 */
export function timeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now.getTime() - past.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  // Less than 1 minute
  if (diffInSeconds < 60) {
    return "Just now";
  }

  // Less than 1 hour
  if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? "1 minute ago" : `${diffInMinutes} minutes ago`;
  }

  // Less than 24 hours
  if (diffInHours < 24) {
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  }

  // Less than 7 days
  if (diffInDays < 7) {
    return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
  }

  // Otherwise, show the date
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = past.getDate();
  const month = months[past.getMonth()];
  const year = past.getFullYear();

  return `${day} ${month} ${year}`;
}
