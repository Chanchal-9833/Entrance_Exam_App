let questions=[];
let current=0;
let answers=JSON.parse(localStorage.getItem("answers"))||[];
let review=[];

document.getElementById("user").innerText =
localStorage.getItem("email");



function showQuestion(){
  let q = questions[current];
  let html = `<h3>Q${current+1}: ${q.question}</h3>`;
  let labels = ["A", "B", "C", "D"];

  q.options.forEach((opt, index) => {
    html += `
    <div class="option-container">
      <label class="option-label">
        <input type="radio" name="ans" 
          ${answers[current]?.answer === opt ? "checked" : ""} 
          onchange="save('${opt}')">
        <span class="option-text">
          <strong class="label-prefix">${labels[index]}.</strong> ${opt}
        </span>
      </label>
    </div>`;
  });

  document.getElementById("questionBox").innerHTML = html;
  updatePalette();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
function save(val){
  answers[current] = {
    answer: val,
    questionId: questions[current]._id
  };

  localStorage.setItem("answers", JSON.stringify(answers));
}

function next(){ if(current<questions.length-1) current++; showQuestion();}
function prev(){ if(current>0) current--; showQuestion();}

function markReview(){ review[current]=true; updatePalette();}

function buildPalette(){
 let p="";
 for(let i=0;i<questions.length;i++){
   p+=`<button onclick="goto(${i})" id="p${i}">${i+1}</button>`;
 }
 document.getElementById("palette").innerHTML=p;
}

function goto(i){ current=i; showQuestion(); }

function updatePalette() {
  for (let i = 0; i < questions.length; i++) {
    let btn = document.getElementById("p" + i);
    
    // Reset classes but keep basic button
    btn.className = ""; 
    
    // Check Status
    if (review[i]) {
      btn.classList.add("purple");
    } else if (answers[i]) {
      btn.classList.add("green");
    } else {
      btn.classList.add("red");
    }

    // Highlight CURRENT question
    if (i === current) {
      btn.classList.add("active");
    }
  }
}
async function submitExam(){
  try {
    let res = await fetch("http://localhost:3000/exam/submit",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
  email: localStorage.getItem("email"),
  paperId: localStorage.getItem("paperId"),
  answers: answers
})
    });

    let data = await res.json();

    // Clear stored data
    localStorage.removeItem("answers");

    // Show success message
    document.body.innerHTML = `
      <div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#f4f6f9;">
        <div style="background:white;padding:40px;border-radius:10px;box-shadow:0 5px 20px rgba(0,0,0,0.1);text-align:center;">
          <h2 style="color:green;">✅ Test Submitted Successfully</h2>
          <p>Please check your email for the result.</p>
          <p style="margin-top:10px;color:gray;">Redirecting to login...</p>
        </div>
      </div>
    `;

    // ⏳ Redirect after 3 seconds
    let sec = 3;
let interval = setInterval(() => {
  document.querySelector("p:last-child").innerText =
    `Redirecting in ${sec} seconds...`;
  sec--;
  if(sec < 0){
    clearInterval(interval);
    window.location.href = "index.html";
  }
}, 1000);
  } catch(err){
    alert("Submission failed. Check server.");
    console.error(err);
  }
}

// TIMER
let time = 0;

async function loadDuration(){
  let res = await fetch("http://localhost:3000/exam/duration");
  let data = await res.json();

  console.log("Duration:", data);

  if(!data.duration){
    time = 30 * 60; // default fallback
  } else {
    time = parseInt(data.duration) * 60;
  }
}

setInterval(() => {
  if(time <= 0) return;

  let m = Math.floor(time / 60);
  let s = time % 60;

  document.getElementById("timer").innerText =
    `⏳ ${m}:${s < 10 ? "0"+s : s}`;

  time--;

  if(time <= 0) submitExam();
}, 1000);

async function loadQuestions(){
  let paperId = localStorage.getItem("paperId");

  let res = await fetch(`http://localhost:3000/exam/questions/${paperId}`);
  let data = await res.json();

  shuffleArray(data); // optional

  questions = data;

  buildPalette();
  showQuestion();
}

async function startExam(){
  await loadDuration();   // ⏱ get duration first
  await loadQuestions();  // 📘 then load questions
}

startExam();