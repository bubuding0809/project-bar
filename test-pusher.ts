import Pusher from 'pusher-js';
try {
  new Pusher('', { cluster: '' });
  console.log("Success");
} catch (e) {
  console.log(e instanceof Error ? e.message : String(e));
}
