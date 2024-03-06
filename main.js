let familyData = [];

async function fetchPeopleData() {
  try {
    let params = new URLSearchParams(window.location.search);
    let filename = params.get('js');
    console.log(filename); // Outputs: "name.json"

    const response = await fetch(`./records/${filename}`);
    const data = await response.json();
    familyData = data;
    displayFamilyData();
  } catch (error) {
    console.error("Error fetching people data:", error);
  }
}

function displayFamilyData() {
  const tableBody = document.getElementById("familyTableBody");
  tableBody.innerHTML = "";
  const idField = document.getElementById("id");
  idField.value = "-1";

  familyData.forEach((person) => {
    if (person.parents) var parents = person.parents.map(getNameById);
    if (person.partners) var partners = person.partners.map(getNameById);
    if (person.children) var children = person.children.map(getNameById);
    const row = document.createElement("tr");
    row.innerHTML = `
                <td>${person.id}</td>
                <td>${person.name}</td>
                <td>${person.surname ? person.surname : "Yok"}</td>
                <td>${person.birthday ? person.birthday : "Yok"}</td>
                <td>${parents ? parents.join(",<br>") : "Yok"}</td>
                <td>${partners ? partners.join(",<br>") : "Yok"}</td>
                <td>${children ? children.join(",<br>") : "Yok"}</td>
                <td>
                    <button onclick="editPerson(${person.id})">Düzenle</button>
                    <button onclick="deletePerson(${person.id})">Sil</button>
                </td>
            `;
    tableBody.appendChild(row);
  });
}

function searchFunction() {
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("searchInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("familyTableBody");
  tr = table.querySelectorAll("tr");

  tr.forEach((row) =>  {
    td = row.getElementsByTagName("td")[0]; // Get the second column (name)
    if (td) {
      txtValue = getNameById(Number(td.textContent));
      if (txtValue.toUpperCase().startsWith(filter)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    }
  });
}


// Function to add a new person to the family
function addPerson() {
  const idInput = document.getElementById("id");
  const nameInput = document.getElementById("name");
  const surnameInput = document.getElementById("surname");
  const birthdayInput = document.getElementById("birthday");
  const parentsInput = document.getElementById("parents");
  const parentsOutput = document.getElementById("parentsvis");
  const partnersInput = document.getElementById("partners");
  const partnersOutput = document.getElementById("partnersvis");
  const childrenInput = document.getElementById("children");
  const childrenOutput = document.getElementById("childrenvis");

  // Get the values from the inputs
  const name = nameInput.value.trim();
  const surname = surnameInput.value.trim();
  const birthday = birthdayInput.value.trim();
  const parents = parentsInput.value.trim();
  const partners = partnersInput.value.trim();
  const children = childrenInput.value.trim();

  // Clear the input fields
  nameInput.value = "";
  surnameInput.value = "";
  birthdayInput.value = "";
  parentsInput.value = "";
  parentsOutput.value = "";
  partnersInput.value = "";
  partnersOutput.value = "";
  childrenInput.value = "";
  childrenOutput.value = "";

  if (idInput.value === "-1") {
    // Create a new person object
    const newPerson = {
      id:
        Math.max.apply(
          Math,
          familyData.map((person) => person.id)
        ) + 1, // Assuming ids are assigned incrementally
      name: name,
      surname: surname,
      birthday: birthday,
      parents: parents ? parents.split(",").map((personId) => Number(personId) || personId == 0 ? Number(personId) : personId) : null,
      partners: partners ? partners.split(",").map((personId) => Number(personId) || personId == 0 ? Number(personId) : personId) : null,
      children: children ? children.split(",").map((personId) => Number(personId) || personId == 0 ? Number(personId) : personId) : null,
    };

    familyData.push(newPerson);
    newPerson.parents.forEach((parentId) => {
        if (Number(parentId)){
          var parent = familyData.find((p) => p.id === parentId);
          if(parent) {
            if (parent.children) {
              parent.children.push(newPerson.id);
            } else {
              parent.children = [newPerson.id];
            }
          }
        }
      });
	  
	showNotification(`${newPerson.name} ${newPerson.surname} başarılı bir şekilde eklenmiştir`);

    // Optionally, you can display or do something with the new person
  } else {
    const editedPerson = {
      id: Number(idInput.value), // Assuming ids are assigned incrementally
      name: name,
      surname: surname,
      birthday: birthday,
      parents: parents ? parents.split(",").map((personId) => Number(personId) || personId == 0 ? Number(personId) : personId) : null,
      partners: partners ? partners.split(",").map((personId) => Number(personId) || personId == 0 ? Number(personId) : personId) : null,
      children: children ? children.split(",").map((personId) => Number(personId) || personId == 0 ? Number(personId) : personId) : null,
    };

    const oldPerson = familyData.find((p) => p.id === Number(idInput.value));

	if(oldPerson.parents){
		oldPerson.parents.forEach((parentId) => {
		  var parent = familyData.find((p) => p.id === parentId);
		  if(parent) parent.children.splice(parent.children.indexOf(oldPerson.id), 1);
		});
	}

	if(editedPerson.parents){
		editedPerson.parents.forEach((parentId) => {
		  var parent = familyData.find((p) => p.id === parentId);
		  if (parent) {
			if (parent.children) {
			  parent.children.push(editedPerson.id);
			} else {
			  parent.children = [editedPerson.id];
			}
		  }
		});
	}

    if (oldPerson.children) {
      oldPerson.children.forEach((childId) => {
        var child = familyData.find((p) => p.id === childId);
        if(child) child.parents.splice(child.parents.indexOf(oldPerson.id), 1);
      });
    }

    if (editedPerson.children) {
      editedPerson.children.forEach((childId) => {
        var child = familyData.find((p) => p.id === childId);
        if(child){
          if (child.parents) {
            child.parents.push(editedPerson.id);
          } else {
            child.parents = [editedPerson.id];
          }
        }
      });
    }

    var oldPersonIndex = familyData.indexOf(oldPerson);

    familyData[oldPersonIndex] = editedPerson;
	
	showNotification(`${editedPerson.name} ${editedPerson.surname} başarılı bir şekilde güncellenmiştir`);
  }

  const addButton = document.getElementById("addButton");
  addButton.textContent = "Kişiyi Ekle";
  idInput.value = "-1";
  displayFamilyData();
}

// Function to edit a person in the family
function editPerson(id) {
  const idInput = document.getElementById("id");
  const nameInput = document.getElementById("name");
  const surnameInput = document.getElementById("surname");
  const birthdayInput = document.getElementById("birthday");
  const parentsInput = document.getElementById("parents");
  const parentsOutput = document.getElementById("parentsvis");
  const partnersInput = document.getElementById("partners");
  const partnersOutput = document.getElementById("partnersvis");
  const childrenInput = document.getElementById("children");
  const childrenOutput = document.getElementById("childrenvis");

  const person = familyData.find((p) => p.id === id);
  if (person.parents) var parents = person.parents.map(getNameById);
  if (person.partners) var partners = person.partners.map(getNameById);
  if (person.children) var children = person.children.map(getNameById);
  

  idInput.value = person.id;
  nameInput.value = person.name;
  surnameInput.value = person.surname;
  birthdayInput.value = person.birthday;

  parentsInput.value = person.parents;
  parentsOutput.value = parents ? parents.join(",") : "Yok";

  partnersInput.value = person.partners;
  partnersOutput.value = partners ? partners.join(",") : "Yok";

  childrenInput.value = person.children;
  childrenOutput.value = children ? children.join(",") : "Yok";

  const addButton = document.getElementById("addButton");
  addButton.textContent = "Güncelle";
  document.documentElement.scrollTop = 0;
}

function deletePerson(id) {
  const personToDelete = familyData.find((person) => person.id === id);

  if (!personToDelete) {
    console.error(`Person with id ${id} not found.`);
    return;
  }

  const confirmation = window.confirm(
    `${personToDelete.name} adlı kişiyi silmek üzeresiniz eğer bu işleme devam edersenız bu kişinin çocukları ve devamınıda silinecektir.`
  );

  if (confirmation) {
    removePersonAndChildren(id);
    displayFamilyData();
  }
}

function removePersonAndChildren(personId) {
  const personToRemove = familyData.find((person) => person.id === personId);

  if (!personToRemove) {
    console.error(`Person with id ${personId} not found.`);
    return;
  }

  // Recursively remove children
  if (personToRemove.children) {
    personToRemove.children.forEach((childId) => {
      removePersonAndChildren(childId);
    });
  }

  // Remove the person from their parents' children array
  if (personToRemove.parents) {
    personToRemove.parents.forEach((parentId) => {
      const parent = familyData.find((p) => p.id === parentId);

      if (parent && parent.children) {
        parent.children = parent.children.filter(
          (childId) => childId !== personId
        );
      }
    });
  }

  // Remove the person from the familyData array
  familyData = familyData.filter((person) => person.id !== personId);

  // Update the display
  displayFamilyData();
}

function discardChanges() {
  const form = document.getElementById("addPersonForm");
  form.reset();
}

function getNameById(personId) {
  if (Number(personId) || personId == 0) {
    const person = familyData.find((p) => p.id === Number(personId));
    return person ? `${person.name} ${person.surname}` : "Unknown";
  } else {
    return personId + " (Sadece isim)";
  }
}

let choosenPeople = [];

function openPersonSelectionModal(field) {
  // You can dynamically populate the parentsList based on your familyData
  const personList = document.getElementById("personList");
  const searchBar = document.getElementById("searchBar");
  searchBar.value = "";
  personList.innerHTML = ""; // Clear previous content

  familyData.forEach((person) => {
    const listItem = document.createElement("li");
    listItem.classList.add("person-item");

    const addButton = document.createElement("button");
    addButton.textContent = "Seç";
    addButton.onclick = () => addSelectedPerson(person.id);

    const label = document.createElement("label");
    label.textContent = `${person.id}: ${person.name} ${person.surname}`;

    listItem.appendChild(label);
    listItem.appendChild(addButton);
    personList.appendChild(listItem);
  });

  const selectedPersonList = document.getElementById(`${field}`);
  if (selectedPersonList.value) {
    selectedPersonList.value.split(",").forEach((personId) => {
      addSelectedPerson(personId);
    });
  }

  const modal = document.getElementById("personModal");
  modal.style.display = "block";
  document.body.classList.add("body-no-scroll");

  const confirmButton = document.getElementById("confirmButton");
  confirmButton.onclick = function () {
    confirmSelectedPersons(field);
  };
}

function closePersonModal() {
  const selectedPersonsList = document.getElementById("selectedPersonsList");
  selectedPersonsList.innerHTML = "";
  choosenPeople = [];

  const modal = document.getElementById("personModal");
  modal.style.display = "none";
  document.body.classList.remove("body-no-scroll");
}

function filterPersons() {
  const searchBar = document.getElementById("searchBar");
  const filter = searchBar.value.toUpperCase();
  const personItems = document.getElementsByClassName("person-item");

  for (const item of personItems) {
    const label = item.querySelector("label");
    const shouldShow = label.textContent
      .toUpperCase()
      .split(": ")[1]
      .startsWith(filter);

    item.style.display = shouldShow ? "flex" : "none";
  }
}

function addSelectedPerson(personId) {
  const selectedPersonsList = document.getElementById("selectedPersonsList");
  const newPersonName = document.getElementById("newPersonName");

  if (personId == -1) personId = newPersonName.value != "" ? newPersonName.value : null;

  if (personId) {
    const listItem = document.createElement("li");
    listItem.textContent = `Eklendi: ${getNameById(personId)}`;
    choosenPeople.push(
      Number(personId) || personId == 0 ? Number(personId) : personId
    );

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "İptal";
    cancelButton.onclick = () =>
      cancelSelectedPerson(
        Number(personId) || personId == 0 ? getNameById(personId) : personId
      );

    listItem.appendChild(cancelButton);
    selectedPersonsList.appendChild(listItem);
    newPersonName.value = "";
  }
}

function cancelSelectedPerson(personId) {
  const selectedPersonsList = document.getElementById("selectedPersonsList");
  const selectedPersonItem = Array.from(selectedPersonsList.children).find(
    (item) => item.textContent.includes(personId)
  );

  if (selectedPersonItem) {
    selectedPersonsList.removeChild(selectedPersonItem);
    choosenPeople.splice(choosenPeople.indexOf(personId), 1);
  }
}

function confirmSelectedPersons(field) {
  const personInput = document.getElementById(`${field}`);
  const personOutput = document.getElementById(`${field}vis`);
  personInput.value = "";
  personOutput.value = "";

  personInput.value = choosenPeople.join(",");
  personOutput.value = choosenPeople.map(getNameById).join(",");
  closePersonModal();
}

function saveChanges() {
  // Create a Blob with the updated data
  const blob = new Blob([JSON.stringify(familyData, null, 2)], {
    type: "application/json",
  });

  var currentDate = new Date();

  // Get the individual components of the date
  var year = currentDate.getFullYear();
  var month = currentDate.getMonth() + 1; // Month is zero-based, so add 1
  var day = currentDate.getDate();
  var hours = currentDate.getHours();
  var minutes = currentDate.getMinutes();
  var seconds = currentDate.getSeconds();

  // Format the date and time as needed
  var formattedDateTime = year + '-' +
    (month < 10 ? '0' : '') + month + '-' +
    (day < 10 ? '0' : '') + day + '-' +
    (hours < 10 ? '0' : '') + hours + '-' +
    (minutes < 10 ? '0' : '') + minutes + '-' +
    (seconds < 10 ? '0' : '') + seconds;


  // Create a link element and trigger a download
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "people_" + formattedDateTime + ".json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function showNotification(message) {
  var bar = document.getElementById('notification-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'notification-bar';
    document.body.appendChild(bar);
  }
  bar.textContent = message;
  bar.style.height = '2.5em';  // Show the bar
  setTimeout(function() {
    bar.style.height = '0';  // Hide the bar after 3 seconds
  }, 3000);
}
