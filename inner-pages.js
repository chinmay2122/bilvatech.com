/* Small enhancements shared only by the inner pages. */
(() => {
  const root = document.querySelector('.bilva-inner');
  if (!root) return;
  const icon = path => `<svg class="page-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`;
  root.querySelectorAll('.site-footer i.fa-arrow-right,.site-footer i.fa-arrow-up').forEach(el => {
    el.outerHTML = icon(el.classList.contains('fa-arrow-up') ? 'M12 19V5m-6 6 6-6 6 6' : 'M5 12h14m-6-6 6 6-6 6');
  });
  const message = root.querySelector('textarea[name="message"]');
<<<<<<< HEAD
  const services = {kernel:'Separation Kernel Hypervisor',iot:'IoT Solutions',cyber:'Secure QR Code',qr:'Secure QR Printing Software',consulting:'Information Security Consulting'};
=======
  const services = {kernel:'Separation Kernel Hypervisor',iot:'IoT Solutions',cyber:'Cybersecurity Solutions',qr:'Secure QR Printing Software',consulting:'Information Security Consulting'};
>>>>>>> a8dd296c550f54f403e78c0fd81df86b2c014592
  const selected = services[new URLSearchParams(location.search).get('service')];
  if (message && selected && !message.value) message.value = `I’d like to discuss ${selected}.\n\n`;
})();
