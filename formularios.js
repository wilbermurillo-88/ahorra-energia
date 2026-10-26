const formConfigs = {
    encuesta: {
        formId: "encuesta-form",
        listId: "encuestas-guardadas",
        storageKey: "ahorra-energia-encuestas-v1",
        title: "Encuestas guardadas",
        columns: [
            ["nombre", "Nombre"],
            ["correo", "Correo"],
            ["personas", "Personas"],
            ["equipo", "Equipo de mayor uso"],
            ["horas_tv", "Horas de TV"],
            ["momento", "Horario de mayor uso"],
            ["habitos", "Hábitos"],
            ["idea", "Idea para ahorrar"]
        ]
    },
    equipo: {
        formId: "registro-form",
        listId: "equipos-guardados",
        storageKey: "ahorra-energia-equipos-v1",
        title: "Equipos registrados",
        columns: [
            ["nombre", "Equipo"],
            ["potencia", "Potencia (W)"],
            ["horas", "Horas al día"],
            ["tipo", "Tipo"],
            ["momento", "Horario"],
            ["desconecta", "Se desconecta"],
            ["fecha", "Fecha"],
            ["notas", "Observaciones"]
        ]
    }
};

function readEntries(storageKey) {
    try {
        const entries = JSON.parse(localStorage.getItem(storageKey) || "[]");
        return Array.isArray(entries) ? entries : [];
    } catch {
        return [];
    }
}

function saveEntries(storageKey, entries) {
    try {
        localStorage.setItem(storageKey, JSON.stringify(entries));
        return true;
    } catch {
        return false;
    }
}

function formatValue(value) {
    if (Array.isArray(value)) return value.length ? value.join(", ") : "No indicado";
    return value || "No indicado";
}

function renderEntries(config) {
    const container = document.getElementById(config.listId);
    if (!container) return;

    container.replaceChildren();
    const entries = readEntries(config.storageKey);
    const heading = document.createElement("h2");
    heading.textContent = `${config.title} (${entries.length})`;
    container.append(heading);

    if (!entries.length) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "Aún no hay datos guardados en este navegador.";
        container.append(emptyMessage);
        return;
    }

    const table = document.createElement("table");
    table.className = "table table-striped table-bordered";
    const head = table.createTHead().insertRow();
    for (const [, label] of config.columns) {
        const cell = document.createElement("th");
        cell.scope = "col";
        cell.textContent = label;
        head.append(cell);
    }
    const body = table.createTBody();
    for (const entry of entries) {
        const row = body.insertRow();
        for (const [key] of config.columns) {
            const cell = row.insertCell();
            cell.textContent = formatValue(entry[key]);
        }
    }
    const responsiveTable = document.createElement("div");
    responsiveTable.className = "table-responsive";
    responsiveTable.append(table);
    container.append(responsiveTable);

    const clearButton = document.createElement("button");
    clearButton.type = "button";
    clearButton.className = "btn btn-secondary";
    clearButton.textContent = "Borrar datos guardados";
    clearButton.addEventListener("click", () => {
        if (confirm("¿Quieres borrar todos los datos guardados en este navegador?")) {
            localStorage.removeItem(config.storageKey);
            renderEntries(config);
        }
    });
    container.append(clearButton);
}

for (const [formType, config] of Object.entries(formConfigs)) {
    const form = document.getElementById(config.formId);
    if (!form) continue;

    renderEntries(config);
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const entry = {};
        for (const [key, value] of new FormData(form)) {
            if (Object.hasOwn(entry, key)) {
                entry[key] = Array.isArray(entry[key]) ? [...entry[key], value] : [entry[key], value];
            } else {
                entry[key] = value;
            }
        }

        const entries = readEntries(config.storageKey);
        entries.push(entry);
        const message = document.getElementById(`${formType}-mensaje`);
        if (saveEntries(config.storageKey, entries)) {
            message.textContent = "Listo: los datos quedaron guardados en este navegador.";
            message.className = "alert alert-success mt-3";
            form.reset();
            renderEntries(config);
        } else {
            message.textContent = "No se pudieron guardar los datos. Revisa el espacio disponible del navegador.";
            message.className = "alert alert-danger mt-3";
        }
    });
}