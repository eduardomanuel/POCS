  // r(n) = r(n-1) - n if > 0 and not found
  // else
  // r(n = r(n-1) + n; 


  var sequence = [];
  
  

    
  function inSeq(candidate) {
    if(candidate == 0) return true;
    else {
      if(recamanAt(candidate-1) == candidate) return true;
      else return false;
    }
  }

 function printRecaman(n) {
   var list = [];   
   for(var i=0; i <= n; i++) {
      list.push(recamanAt(i));    
   }
   console.log("recaman(" + n + ")=" + recamanAt(n) + "\nlist = " + list);
 }
  
  
  function recamanAt(n) {  
    if(n == 0) return 0;
    else {      
      var candidate1 = recamanAt(n-1) - n;
      var candidate2 = recamanAt(n-1) + n;
      if((candidate1 > 0) && !inSeq(candidate1)) {
       // sequence.push(candidate1);
        return(candidate1);
      }
      else {
       // if(!inSeq(candidate2)) sequence.push(candidate2);
        return(candidate2);
      }
    } 
    
  }

  function resetSequenceList() {
    sequence.length = 0;
    sequence.push(0);
  }

  function calculate() {
    resetSequenceList();

    var n = document.getElementById("recIndex").value;
    var n = n - 0;
    var output = document.getElementById("output");

    // output.value = "number in sequence at specified position :" + recamanAt(n) + "\n----------------------------------------\n";
    printRecaman(n);
    // output.value += printRecaman(n).toString();
  }
  
  
 
  
  