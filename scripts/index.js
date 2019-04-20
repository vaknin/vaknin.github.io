$('#view-projects').on('click', function(){scrollSmoothly("#projects", 900);});
$('#btn-contact').on('click', function(){scrollSmoothly("#contact", 1400);});

function scrollSmoothly(dest, ms){
const destination = $(dest).position().top;

$('html, body').animate(
{
    scrollTop: destination
}, ms);
}