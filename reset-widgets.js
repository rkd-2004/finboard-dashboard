// Quick script to reset widget configurations
// Open browser console and run this to clear all widgets and reload with updated configurations

// Clear localStorage to reset widgets
localStorage.removeItem('dashboard-storage');

// Reload the page
window.location.reload();

console.log('Widgets reset! All widgets will use updated field mappings.');