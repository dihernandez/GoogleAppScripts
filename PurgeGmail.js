
// copy pasta'd from https://ctrlq.org/code/19383-bulk-delete-gmail
// with edit to pass params rather than set global constants

function purgeGmail(gmail_label, purge_after) {
  
  var age = new Date();  
  age.setDate(age.getDate() - purge_after);    
  
  var purge  = Utilities.formatDate(age, Session.getScriptTimeZone(), "yyyy-MM-dd");
  var search = "label:" + gmail_label + " before:" + purge;

  // This will create a simple Gmail search 
  // query like label:Newsletters before:10/12/2012
  
  try {
    
    // We are processing 100 messages in a batch to prevent script errors.
    // Else it may throw Exceed Maximum Execution Time exception in Apps Script

    var threads = GmailApp.search(search, 0, 500);
    

    // For large batches, create another time-based trigger that will
    // activate the auto-purge process after 'n' minutes.

    if (threads.length == 100) {
      ScriptApp.newTrigger("purgeGmail")
               .timeBased()
               .at(new Date((new Date()).getTime() + 1000*60*10))
               .create();
    }

    // An email thread may have multiple messages and the timestamp of 
    // individual messages can be different.
    
    for (var i=0; i<threads.length; i++) {
      var messages = GmailApp.getMessagesForThread(threads[i]);
      for (var j=0; j<messages.length; j++) {
        var email = messages[j];       
        if (email.getDate() < age) {
          email.moveToTrash();
        }
      }
    }
    
  // If the script fails for some reason or catches an exception, 
  // it will simply defer auto-purge until the next day.
  } catch (e) {}
  
}

//---------------------------------------------------------------------------------
// My bit
function PurgeParameter(gmail_label, purge_after) {
    this.gmail_label = gmail_label;
    this.purge_after = purge_after;
}

function keepInboxClearOfSpam(labels){
  var LABELS = new Array();
  
  var obj = {gmail_label:"openstack-dev-request", purge_after:"1"}
  LABELS.push(obj);
  LABELS[0].gmail_label
  obj = {gmail_label:"Groupon", purge_after:"1"};
  LABELS.push(obj);
  obj = {gmail_label:"CVS", purge_after:"1"};
  LABELS.push(obj);
  obj = {gmail_label:"freefood@mit.edu", purge_after:"1"};
  LABELS.push(obj);
  obj = {gmail_label:"reuse@mit.edu", purge_after:"1"};
  LABELS.push(obj);
  obj = {gmail_label:"wall-bot@mit.edu", purge_after:"1"};
  LABELS.push(obj);
  obj = {gmail_label:"no-reply@slack.com", purge_after:"1"};
  LABELS.push(obj);
  while(true){
    for(var i = 0; i < LABELS.length; i++){
        var param = LABELS[i];
        purgeGmail(param.gmail_label, param.purge_after); 
        }; 
   }
}

function clearInbox(){
  while(GmailApp.getInboxUnreadCount() > 0){
    var threads = GmailApp.search("is:unread", 0, 500);
    
      
    for (var i=0; i<threads.length; i++) {
      var messages = GmailApp.getMessagesForThread(threads[i]);
      for (var j=0; j<messages.length; j++) {
        var email = messages[j];       
        if (email.isUnread()) {
          email.markRead();
        }
      }
    }
  }

}
//---------------------------------------------------------------------------------
