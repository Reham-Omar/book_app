$(document).ready(function(){
    $('#update_form').hide();
    $('#update_btn').on('click', function(){
        $('#update_form').toggle();
    })
})

function openNav() {
    document.getElementById("myNav").style.display = "block";
  }
  
  function closeNav() {
    document.getElementById("myNav").style.display = "none";
  }