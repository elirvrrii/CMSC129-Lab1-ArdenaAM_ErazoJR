import { useState, useEffect } from "react";
import "./App.css";

function App(){

const [title,setTitle] = useState("");
const [content,setContent] = useState("");
const [date,setDate] = useState("");
const [mood,setMood] = useState("");

const [journals,setJournals] = useState([]);
const [selected,setSelected] = useState(null);

const [view,setView] = useState("active");
const [mode,setMode] = useState("view");

const [editingId,setEditingId] = useState(null);
const [message,setMessage] = useState("");

const resetEditor = ()=>{
setTitle("");
setContent("");
setDate("");
setMood("");
setEditingId(null);
};

const fetchJournals = async()=>{

const endpoint =
view==="deleted"
? "http://localhost:5000/api/journal/deleted"
: "http://localhost:5000/api/journal";

const res = await fetch(endpoint);
const data = await res.json();

setJournals(data);

if(data.length>0){
setSelected(data[0]);
}else{
setSelected(null);
}

};

useEffect(()=>{
fetchJournals();
},[view]);

const saveJournal = async()=>{

const bodyData = {title,content,date,mood};

if(editingId){

await fetch(`http://localhost:5000/api/journal/${editingId}`,{
method:"PUT",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(bodyData)
});

setMessage("Journal updated!");

}else{

await fetch("http://localhost:5000/api/journal",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(bodyData)
});

setMessage("Journal saved!");

}

resetEditor();
setMode("view");
fetchJournals();

};

const deleteJournal = async(id)=>{

if(!window.confirm("Move journal to Deleted Entries?")) return;

await fetch(`http://localhost:5000/api/journal/${id}`,{
method:"DELETE"
});

fetchJournals();

};

const restoreJournal = async(id)=>{

await fetch(`http://localhost:5000/api/journal/restore/${id}`,{
method:"PUT"
});

fetchJournals();

};

const hardDeleteJournal = async(id)=>{

if(!window.confirm("Permanently delete this entry?")) return;

await fetch(`http://localhost:5000/api/journal/hard/${id}`,{
method:"DELETE"
});

fetchJournals();

};

const editJournal = (entry)=>{

setTitle(entry.title);
setContent(entry.content);
setDate(entry.date);
setMood(entry.mood);

setEditingId(entry._id);
setMode("edit");

};

const newEntry = ()=>{
resetEditor();
setMode("create");
};

return(

<div className="layout">

{/* SIDEBAR */}

<aside className="sidebar">

<h2 className="logo">Journal</h2>

<ul>

<li
className={view==="active"?"active":""}
onClick={()=>setView("active")}
>
All Entries
</li>

<li
className={view==="deleted"?"active":""}
onClick={()=>setView("deleted")}
>
Deleted Entries
</li>

<li>Ideas</li>
<li>Goals</li>
<li>Quotes</li>

</ul>

</aside>

{/* ENTRY LIST */}

<div className="entryList">

<h3>{view==="deleted"?"Deleted Entries":"Entries"}</h3>

{journals.map(entry=>(

<div
key={entry._id}
className={`entryItem ${selected?._id===entry._id?"selected":""}`}
onClick={()=>{
setSelected(entry);
setMode("view");
}}
>

<h4>{entry.title}</h4>
<p>{entry.date} • {entry.mood}</p>

</div>

))}

</div>

{/* VIEWER PANEL */}

<div className="viewer">

{/* EMPTY STATE */}

{mode==="view" && journals.length===0 &&(

<div className="emptyState">

<h2>No Journal Entries Yet</h2>

<p>Create your first journal entry</p>

<button className="bigAddBtn" onClick={newEntry}>
➕ Add Entry
</button>

</div>

)}

{/* VIEW ENTRY */}

{mode==="view" && selected &&(

<>

<h1>{selected.title}</h1>

<p className="meta">
📅 {selected.date} • {selected.mood}
</p>

<p className="viewerContent">
{selected.content}
</p>

<div className="viewerActions">

{view==="active" &&(
<>
<button onClick={()=>editJournal(selected)}>Edit</button>

<button
className="delete"
onClick={()=>deleteJournal(selected._id)}

>

Delete </button>
</>
)}

{view==="deleted" &&(
<>
<button onClick={()=>restoreJournal(selected._id)}>
Restore </button>

<button
className="delete"
onClick={()=>hardDeleteJournal(selected._id)}

>

Delete Permanently </button>
</>
)}

</div>

<button className="floatingAddBtn" onClick={newEntry}>
➕ Add Entry
</button>

</>

)}

{/* EDITOR */}

{mode!=="view" &&(

<div className="editor">

<h2>{mode==="edit"?"Edit Entry":"New Entry"}</h2>

<input
placeholder="Journal title..."
value={title}
onChange={(e)=>setTitle(e.target.value)}
/>

<input
type="date"
value={date}
onChange={(e)=>setDate(e.target.value)}
/>

<select
value={mood}
onChange={(e)=>setMood(e.target.value)}

>

<option value="">Select Mood</option>
<option>😊 Happy</option>
<option>😐 Neutral</option>
<option>😢 Sad</option>
<option>😡 Angry</option>
<option>😴 Tired</option>
<option>🤩 Excited</option>

</select>

<textarea
placeholder="Write your thoughts..."
value={content}
onChange={(e)=>setContent(e.target.value)}
/>

<div className="editorActions">

<button onClick={saveJournal}>
Save Entry
</button>

<button
className="cancelBtn"
onClick={()=>{
setMode("view");
resetEditor();
}}
>
Cancel
</button>

</div>

<span className="message">{message}</span>

</div>

)}

</div>

</div>

);

}

export default App;
