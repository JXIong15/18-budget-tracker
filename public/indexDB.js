const request = indexedDB.open("budgetDB", 1);
let db;

request.onupgradeneeded = function (e) {
    const db = request.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onerror = function (e) {
    console.log("There was an error");
};

request.onsuccess = function (e) {
    db = request.result;
    db.onerror = function (e) {
        console.log("error");
    };
    checkDB(db);
}

function checkDB(db) {
    const tx = db.transaction(["pending"], "readwrite");
    const store = tx.objectStore("pending");
    const all = store.getAll();

    all.onsuccess = function () {
        if (all.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(all.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => {
                    return response.json();
                })
                .then(() => {
                    const tx = db.transaction(["pending"], "readwrite");
                    const store = tx.objectStore("pending");
                    store.clear();
                })
        }
    }
}


// index.js function to save a new record
function saveRecord(record) {
    const tx = db.transaction(["pending"], "readwrite");
    const store = tx.objectStore("pending");
    console.log(store);
    console.log(record);
    store.add(record);
}
