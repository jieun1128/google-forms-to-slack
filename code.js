// This Google Sheets script will post to a slack channel when a user submits data to a Google Forms Spreadsheet
// View the README for installation instructions. Don't forget to add the required slack information below.

// Source: https://github.com/markfguerra/google-forms-to-slack

/////////////////////////
// Begin customization //
/////////////////////////

// Alter this to match the incoming webhook url provided by Slack
var slackIncomingWebhookUrl = '';

// Include # for public channels, omit it for private channels
var postChannel = "#";

var postIcon = ":mailbox_with_mail:";
var postUser = "Form Response";
var postColor = "#0000DD";

var messageFallback = "The attachment must be viewed as plain text.";
var messagePretext = "사용자로부터 서버 사용 요청이 들어왔습니다.";

///////////////////////
// End customization //
///////////////////////

// In the Script Editor, run initialize() at least once to make your code execute on form submit
function initialize() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i in triggers) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
  ScriptApp.newTrigger("submitValuesToSlack")
    .forForm(FormApp.getActiveForm())
    .onFormSubmit()
    .create();
}

// Running the code in initialize() will cause this function to be triggered this on every Form Submit
function submitValuesToSlack(e) {

  var formResponse = e.response;
  var itemResponses = formResponse.getItemResponses();
  
  var attachments = constructAttachments(itemResponses);

  var payload = {
    "channel": postChannel,
    "username": postUser,
    "icon_emoji": postIcon,
    "link_names": 1,
    "attachments": attachments
  };

  var options = {
    'method': 'post',
    'payload': JSON.stringify(payload)
  };

}

// Creates Slack message attachments which contain the data from the Google Form
// submission, which is passed in as a parameter
// https://api.slack.com/docs/message-attachments
var constructAttachments = function(values) {
  var fields = makeFields(values);

  var attachments = [{
    "fallback" : messageFallback,
    "pretext" : messagePretext,
    "mrkdwn_in" : ["pretext"],
    "color" : postColor,
    "fields" : fields
  }]

  return attachments;
}

// Creates an array of Slack fields containing the questions and answers
var makeFields = function(values) {
  var fields = [];

  for (var i = 0; i < values.length; i++) {
    var item = values[i];
    var columnName = item.getItem().getTitle();
    var val = item.getResponse();
    fields.push(makeField(columnName,val));
  }

  return fields;
}

// Creates a Slack field for your message
// https://api.slack.com/docs/message-attachments#fields
var makeField = function(question, answer) {
  var field = {
    "title" : question,
    "value" : answer,
    "short" : false
  };
  return field;
}