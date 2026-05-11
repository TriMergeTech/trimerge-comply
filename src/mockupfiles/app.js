
document.querySelectorAll('.password-toggle').forEach((button) => {
  button.addEventListener('click', () => {
    const input = button.parentElement.querySelector('input');
    input.type = input.type === 'password' ? 'text' : 'password';
  });
});

const otpInputs = [...document.querySelectorAll('.otp-boxes input')];
otpInputs.forEach((input, index) => {
  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '').slice(0, 1);
    if (input.value && otpInputs[index + 1]) otpInputs[index + 1].focus();
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Backspace' && !input.value && otpInputs[index - 1]) otpInputs[index - 1].focus();
  });
});

const countdown = document.querySelector('.countdown');
if (countdown) {
  let seconds = 45;
  setInterval(() => {
    if (seconds <= 0) return;
    seconds -= 1;
    countdown.textContent = `(00:${String(seconds).padStart(2, '0')})`;
  }, 1000);
}
