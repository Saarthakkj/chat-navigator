// this file automatically calls when url matches with the given urls in manifest.json 
// so can just insert a div element here 

var index =1 ;
var targetElement ;
async function waitforelement(tagName){
	console.log("classname : " , tagName); 
	var flag = false;
	var ele  ;
	//classname = escapeClassName(classname);
	try{
		return new Promise((resolve ,reject ) => {
			const startTime = Date.now();
			const checkElements = () => {
				ele = document.querySelector(tagName)
				if(ele){ele = ele.parentNode;}
				console.log("ele : " , ele);
				if(ele){
					console.log("1 element ");
					resolve(ele);
				}		
				else if(Date.now() - startTime > 10000)  {
					console.log("time out , more than 3 seconds passed");
					resolve();
				}else{
					console.log("calling checkelements again after 500ms");
					setTimeout(checkElements , 500);
				}
			}
			checkElements();
			if(!ele) console.log(" ele ampty after checking leements");
		} );
	}catch(e){
		console.error("error execxuting waitforelements : " , e );
	}
}
(async () => { 
	targetElement = await waitforelement('article');
	console.log("target : " , targetElement);
	
	//---------Synchrnously handling all the existing chats-----------
	const childnodeTraversal = targetElement.querySelectorAll("*");
	childnodeTraversal.forEach( (chats) =>{
		if(chats.className === "whitespace-pre-wrap"){
			try{
				chats.id = `index-${index}`
				addRow(index + ". " + chats.innerHTML.substring(0, 12) , chats.id);	
				console.log("cjats id : " , chats.id);
				index++;
			}catch(e){
				console.log("error adding id and passing it in addRow : " , e);
			}
		}
	});





	//----------Asynchrnously handling all the chats [making an observer] ------
	//if(targetElement.length > 1) console.log("target element length is more than 1 "); 
	//else console.log(" one element only : " , targetElement );
	//targetElement = targetElement[0]; // only one element in collection 
	const config = {
		childList : true  // dont need i guess
	}
	const obs = new MutationObserver(callback);
	try {
		obs.observe(targetElement, config); 
	} catch(e) {
		console.error("observer initialisation failing , error : " , e) ;
		console.log(" target elemnt : " ,  targetElement );
	}
})();
//--------- the observer ----
function callback(mutationList , observer){
	console.log("mutation detected !") ;
	for (const mutation of mutationList){
		console.log('child nodes were added');

		mutation.addedNodes.forEach(node => {
			console.log("all nodes : " , node);
			if(node.tagName.toLowerCase() === 'article'){
				console.log("node : " , node);
				console.log("node inner text  : " , node.innerHTML);
				try{
					const chatText = node.querySelectorAll('*');
					chatText.forEach(chat => {
						console.log("chat : " , chat);
						if(chat.className === "whitespace-pre-wrap"){
							console.log("chat text that matters : " , chat.innerHTML);
							chats.id = `index-${index}`;
							addRow(index + ". " + chat.innerHTML.slice(0 , 12) , chats.id);
							index++; 
						}
						//console.log("chat-text : " , chat.innerHTML );
					});
	//				console.log("chatText : " , chatText);
				}catch(e){
					console.log("error detching text content : " , e);
				}
			}
			// -- new added chats
			// check if [data-test-id = conversation-turn-{num} ]: num is odd
			//console.log(" node : " , node) ; 
			//const turn_str = node.'data-test-id' ; 
			/*if(!turn_str) console.log("turn str is null " ); 
			console.log("turn str : " , turn_str);
			int turn =parseInt(turn_str[turn_str.length-1]);
			if(turn%2){
				// --got a user response chat 
				addRow(node.textContent.slice(0 , 5);

			}*/

		})

	}
}



//------------- Div creation for chat side bar (can run synchronously with content.js) ---

var chat_sidebar = document.createElement("table"); 
chat_sidebar.id = "chat"; 
chat_sidebar.textContent = "side-bar for chat"
chat_sidebar.style.color = "black"
// --- positioning styles 
chat_sidebar.style.position = "fixed" ; 
chat_sidebar.style.height = "100px";
chat_sidebar.style.width = "300px";
chat_sidebar.style.right = "10px" ; 
chat_sidebar.style.top = "50px" ;
chat_sidebar.style.zIndex = "1000" ; //high enough to be in top of other elements

chat_sidebar.style.backgroundColor = "grey" ; 
chat_sidebar.style.padding = "50px";
chat_sidebar.style.border = "100 solid black"  ;


function addRow(rowData , id) {
	const chat_sidebar = document.getElementById('chat') ;
	if(chat_sidebar){
		const newRow = chat_sidebar.insertRow();
		const cell = newRow.insertCell();
		//cell.textContent = rowData;
		cell.style.border = "1px solid black"; 
		cell.style.padding = "8px" ;
		//cell.href = '#'+id;
		cell.innerHTML = `<a href="#${id}">${rowData}</a>`;
	}
	else{
		console.error("chat siderbar div element not found"); 
	}
	
}

let isDragging = false;
let offsetX , offsetY ;

/*
// ----  mouse down : start dragging --- 

chat_sidebar.addEventListener('mousedown' , (e) => {
	isDragging = true ; 


	offsetX = e.clientX - chat_sidebar.getBoundingClientRect().left ;
	offsetY = e.clientY - chat_sidebar.getBoundingClientRect().top;

	chat_sidebar.style.cursor = 'grabbing' ;
	e.preventDefault();

});

document.addEventListener('mousemove' , (e) =>{
	if(!isDragging) return ;

	let newX = e.clientX - offsetX; 
	let newY = e.clientY - offsetY ;

	chat_sidebar.style.left = `${newX}px`;
	chat_sidebar.style.top = `${newY}px`;
});

document.addEventListener('mouseup' , () => {
	if(isDragging){
		isDragging = false;

		//restore teh original cursor 
		chat_sidebar.style.cursor = 'move' ;
	}
});

chat_sidebar.addEventListener('selectStart' , (e) =>{
	e.preventDefault();
});

*/
console.log("added chatside bar") ;
document.body.appendChild(chat_sidebar) ; 
// addRow("1. hello world"); --test function call 


