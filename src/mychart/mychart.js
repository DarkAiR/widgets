define('mychart', ['d3'], function (d3) {
        return function(instanceData) {
            window.addEventListener('DOMContentLoaded', (event) => {
                var el = document.getElementById(instanceData.id);
                el.innerHTML = '<svg id="qweqwesvg" width="100" height="100"><circle cx="50" cy="50" r="40"></circle></svg>';
            });
        }
    }
);
