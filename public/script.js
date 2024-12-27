// public/script.js
document.getElementById('jsonForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const inputs = document.querySelectorAll('#inputFields input');
    const params = new URLSearchParams();

    // Loop through the input fields and add them to the URLSearchParams
    for (let i = 0; i < inputs.length; i += 2) {
        const name = inputs[i].value;
        const id = inputs[i + 1].value;
        params.append(name, id);
    }

    // Construct the URL with query parameters
    const url = `/rest/v1/7bg89ds39dbvfd1b5783/p/client/write?${params.toString()}`;

    fetch(url)
        .then(response => response.text())
        .then(data => {
            document.getElementById('response').innerText = data;
        })
        .catch(error => {
            document.getElementById('response').innerText = 'Error: ' + error;
        });
});

// Add functionality to dynamically add more input fields
document.getElementById('addField').addEventListener('click', function() {
    const inputFields = document.getElementById('inputFields');
    const newField = document.createElement('div');
    newField.innerHTML = `
        <input type="text" name="name" placeholder="Name" required>
        <input type="text" name="id" placeholder="ID" required>
    `;
    inputFields.appendChild(newField);
});
