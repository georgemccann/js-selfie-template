window.onload = function(){
  const button    = document.getElementById('submit');
  const number    = document.getElementById('distance');
  const type      = document.getElementById('type');
  const err       = document.getElementById('errorContainer');
  function submitForm(e){
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(function(stream) {
      const distance  = number.value;
      const method    = type.options[type.selectedIndex].value;
      if(navigator.userAgent.match('CriOS')){
        err.innerHTML = 'Sorry Chrome on iOS is not supported - please use Safari.'
      } else {
        if(!distance || !method || method === 'none'){
          err.innerHTML = 'Please fill out all fields';
        } else {
          localStorage.setItem('data', JSON.stringify({distance, method}));
          window.location.href = '/filter.html';
        }
      }
      
    })
    .catch(function(err) {
        console.log(err);
        alert('We need access to your camera! Please enable permissions for this site in your device settings.')
        err.innerHTML = 'We need access to your camera! Please enable permissions for this site in your device settings.';
    });

    
  }
  function clearError(){
    err.innerHTML = '';
  }
  button.addEventListener('click', submitForm, false);
  number.addEventListener('click', clearError, false);
  type.addEventListener('click', clearError, false);
};