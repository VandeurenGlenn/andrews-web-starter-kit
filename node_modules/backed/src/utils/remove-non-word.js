export default (string) => string.replace(/[^0-9a-zA-Z\xC0-\xFF \-]/g, '');
