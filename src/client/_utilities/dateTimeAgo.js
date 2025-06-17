export const dateTimeAgo = (dateStr) => {
    if (dateStr) {
        let date = new Date(dateStr);
        var seconds = Math.floor((new Date() - date) / 1000);
    
        var interval = seconds / 31536000; // Years
        if (interval >= 1) {
            var years = Math.floor(interval);
            return years === 1 ? "1 year" : years + " years";
        }
    
        interval = seconds / 2592000; // Months
        if (interval >= 1) {
            var months = Math.floor(interval);
            return months === 1 ? "1 month" : months + " months";
        }
    
        interval = seconds / 86400; // Days
        if (interval >= 1) {
            var days = Math.floor(interval);
            return days === 1 ? "1 day" : days + " days";
        }
        
            interval = seconds / 3600; // Hours
        if (interval >= 1) {
            var hours = Math.floor(interval);
            return hours === 1 ? "1 hour" : hours + " hours";
        }
    
        interval = seconds / 60; // Minutes
        if (interval >= 1) {
            var minutes = Math.floor(interval);
            return minutes === 1 ? "1 minute" : minutes + " minutes";
        }
    
        return Math.floor(seconds) + " seconds"; // Seconds
    } 
}