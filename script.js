
document.addEventListener('DOMContentLoaded',()=>{
  const form=document.querySelector('form[data-consulting-form]');
  if(form){
    form.addEventListener('submit',()=>{
      localStorage.setItem('smbiz_last_submit', new Date().toISOString());
    });
  }
});
