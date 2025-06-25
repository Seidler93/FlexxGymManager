export function getStatusClass(status) {
  switch (status?.toLowerCase()) {
    case 'active': return 'status-blue';
    case 'green hold': return 'status-green';
    case 'yellow hold': return 'status-yellow';
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
