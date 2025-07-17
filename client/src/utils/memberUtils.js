export function getStatusClass(status) {
  switch (status?.toLowerCase()) {
    case 'active': return 'status-blue';
    case 'hold': return 'status-green';
    case 'extended hold': return 'status-yellow';
    case 'cancel': return 'status-red';
    default: return '';
  }
}

export function getTempClass(temp) {
  switch (temp?.toLowerCase()) {
    case 'green': return 'status-green';
    case 'yellow': return 'status-yellow';
    case 'red': return 'status-red';
    default: return '';
  }
}
