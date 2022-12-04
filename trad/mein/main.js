import { Instruction, convertRegToAbi } from "../core/Instruction.js";

const input = document.getElementById('search-input');
const abiParameter = document.getElementById('abi');
const isaParameter = document.getElementById('isa');


window.onload = function () {
  if (!window.location.hash) {
    return;
  }

  let hash = window.location.hash.substring(1);
  let params = hash
    .split('&')
    .map(kv => kv.split('=', 2))
    .reduce((res, [k, v]) =>
      ({ ...res, [k]: v.replace(/\+/g, ' ') }),
      {}
    );

  input.value = params.q;

  abiParameter.checked = (params.abi === "true");

  isaParameter.value = params.isa || "auto";

 
  let event = new Event('keydown');
  event.key = 'Enter';
  input.dispatchEvent(event);
}

input.onkeydown = function (event) {

  if (event.key !== 'Enter') {
    return;
  }

  runResult();
}

function runResult() {

  let q = input.value;
  // Reset UI if query is empty
  if (q === "") {
    document.getElementById('results-container-box').style.display = 'none';
    history.pushState(null, null, ' ');
    return;
  }

  // Set hash
  window.location.hash = 'q=' + q.replace(/\s/g, '+') + '&abi=' + abiParameter.checked + '&isa=' + isaParameter.value;

  // Convert instruction
  try {
    const inst = new Instruction(q,
      {
        ABI: abiParameter.checked,
        ISA: COPTS_ISA[isaParameter.value]
      });
    renderConversion(inst, abiParameter.checked);
  } catch (error) {
    renderError(error);
  }

  // Display conversion results
  document.getElementById('results-container-box').style.display = 'initial';
}

function renderConversion(inst, abi=false) {
  document.getElementById("valid-result").style.display = "inherit";
  document.getElementById("error-container").style.display = "none";
  // Display hex instruction
  document.getElementById('hex-data').innerText = '0x' + inst.hex;

  // Display format and ISA
  document.getElementById('fmt-data').innerText = inst.fmt;
  document.getElementById('isa-data').innerText = inst.isa;

  // Display assembly instruction
  let asmInst;
  let asmTokens = inst.asmFrags.map(frag => {
    let asm = abi ? convertRegToAbi(frag.asm) : frag.asm;
    let field = frag.field.match(/^[a-z0-9]+/);
    let color = fieldColorMap[field];

    if (frag.mem) {
      asm = '(' + asm + ')';
    }
    
    return `<span style='color:var(${color})'>${asm}<span/>`;
  });

  asmInst = asmTokens[0];
  for (let i = 1; i < asmTokens.length; i++) {
    // Append delimeter
    if (i === 1) {
      asmInst += ' ';
    }
    else if (!inst.asmFrags[i].mem || !/^imm/.test(inst.asmFrags[i-1].field)) {
      asmInst += ', ';
    }

    // Append assembly fragment
    asmInst += asmTokens[i];
  }
  document.getElementById('asm-data').innerHTML = asmInst;

  // Display binary instruction
  let idx = 0;
  let binaryData = "";
  inst.binFrags.forEach(frag => {
    let field = frag.field.match(/^[a-z0-9]+/);
    let color = fieldColorMap[field];

    [...frag.bits].forEach(bit => {
      let bitElm = document.getElementsByClassName('binary-bit')[idx];
      bitElm.innerText = bit;
      binaryData += bit;
      bitElm.style.color = `var(${color})`;
      idx++;
    });
  });

  // Copy button function
  let copyBtn = {
    "asm-copy": inst.asm,
    "binary-copy": binaryData,
    "hex-copy": '0x' + inst.hex
  }

  for (let buttonId in copyBtn) {
    let button = document.getElementById(buttonId);
    button.addEventListener("click", () => {
      navigator.clipboard.writeText(copyBtn[buttonId]);
    })
  }
}


function renderError(error) {
  // log them to the console - this provides an quick way to get a traceback in the browser
  console.error(error);

  const resultsContainerElm = document.getElementById('error-container');
  resultsContainerElm.style.display = "inherit";
  document.getElementById("valid-result").style.display = "none";

  // Reset result container
  resultsContainerElm.innerHTML = '';

  // Create row title + data
  let errorTitle = document.createElement('div')
  errorTitle.classList.add('result-row', 'result-row-title');
  errorTitle.textContent = 'Error = '

  let errorData = document.createElement('div')
  errorData.classList.add('result-row');
  errorData.style.color = 'var(--color-red)';
  errorData.textContent = error;

  // Display row
  resultsContainerElm.append(errorTitle);
  resultsContainerElm.append(errorData);
}


document.addEventListener("keydown", e => {
  // Ignore any other keys than '/'
  if (e.key !== "/" || e.ctrlKey || e.metaKey)
    return;
  // Ignore event if focus is currently in a form
  if (/^(?:input|textarea|select|button)$/i.test(e.target.tagName))
    return;

  e.preventDefault();
  input.focus();
});

// Control the modal div
const modalDiv = document.getElementById("modal-container");
const parameterBtn = document.getElementById("parameter-button");
const closeBtn = document.getElementById('close');
const isaMenu = document.getElementById('isa');

// Add ISA option based on Config.js provides
for (let option in COPTS_ISA) {
  let isaOption = document.createElement("option");
  isaOption.text = option;
  isaOption.value = option;
  isaMenu.add(isaOption);
}

// When user clicks the button, display the modal div
parameterBtn.addEventListener("click", () => {
    modalDiv.style.display = "block";
  }
);

// When user clicks the close button or outside the modal div, close the div and update the result
function updateParameter() {
  modalDiv.style.display = "none";
  runResult();
}

closeBtn.addEventListener("click", () => {
  updateParameter();
})

window.addEventListener("click", (event) => {
    if (event.target == modalDiv) {
      updateParameter();
    }
  }
)
