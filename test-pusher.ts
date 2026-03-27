import Pusher from 'pusher-js';
try {
  new Pusher('', { cluster: '' });
  console.log("Success");
} catch (e: any) {
  console.log(e.message);
}
