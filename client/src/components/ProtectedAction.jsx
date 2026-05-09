import React from 'react';

function ProtectedAction({ 
  children, 
  routeName, 
  fallback = null, 
  user = null 
}) {
  // Access checking removed - always allow actions
  return children;
};

export default ProtectedAction;
