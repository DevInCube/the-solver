window.addEventListener('load', function (e) {
    System
        .import('main')
        .then(null, console.error.bind(console));
});