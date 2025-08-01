function readCookie(name) {
  var nameEQ = encodeURIComponent(name) + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ')
          c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0)
          return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
}

$(document).on('knack-view-render.any', function (event, view, data) {
    $('[class="kn-container"]').hide();
    $('[class="kn-info kn-container"]').hide();

    submitUserLoginForm();
});

function getTokenFromURL(url){
  if (url.indexOf('token=')!==-1){
    let tokenS = url.substring(url.indexOf('token=')+6);
    if (tokenS.indexOf('&')!==-1){
      tokenS = tokenS.substring(tokenS,tokenS.indexOf('&'));
    } 
    return decodeURIComponent(tokenS);
  } else { return null}
}

var submitUserLoginForm = function() {
  console.log('submitUserLoginForm');
  const url = window.location.href;
  let token = getTokenFromURL(url);
  if (token) token = atob(token);
  if (!token){
    if ($('[id="email"]').length>0 && $('[id="password"]').length>0){
      console.log('on page direct without login');
      setTimeout(function () { document.location = 'https://www.stellantisandyou.co.uk/digital#home/?redirectApp='+btoa(url); }, 100)
    }
    return;
  }
  if (!token.includes('#')){
    console.log('Wrong token');
    return;
  }
  let userName2 = token.split('#')[0];
  let password = token.split('#')[1];

  let masterUserEmail = readCookie('SYmasterAppUserEmail');

  if ((Knack.session.user && userName2!==Knack.session.user.values.email.email) || (masterUserEmail && Knack.session.user && masterUserEmail!==Knack.session.user.values.email.email)){
    console.log('different user');
    setTimeout(function () { $('a[class="kn-log-out"]').eq(0).click(); setTimeout(function () { document.location = url; }, 1000);}, 1000);
  }

  if ($('[id="email"]').length===0){
    return;
  }
    
    //type userName from url, my secret password and click login
    //if auth successfully then it shows the app, otherwise login screen
    $('[id="email"]').val(userName2);
    $('[id="password"]').val(password);
    $('input[type="submit"]').click();
};

$(document).on('knack-view-render.view_7614', function (event, view, data) {
    const scrollTo = (pos) =>{
        window.scrollTo(0, pos);
    };
       const buttonSelector = "#view_7644 > div > div > button:nth-child(2)"
    Knack.$(buttonSelector).on("click", function(){
        //change where you want to scroll to on the page
        const scrollPoint = 700
        scrollTo(scrollPoint)
    })

});

$(document).on('knack-view-render.view_7614', function (event, view, data) {
    const scrollTo = (pos) =>{
        window.scrollTo(0, pos);
    };
       const buttonSelector = "#view_7644 > div > div > button:nth-child(3)"
    Knack.$(buttonSelector).on("click", function(){
        //change where you want to scroll to on the page
        const scrollPoint = 1100;
        scrollTo(scrollPoint)
    })

});

//***Code to minimise or expand groupings in a grid view***

$(document).on("knack-records-render.view_7876", function (event, view, data) {
    setupExpandableGridViewGroups(view);
});

$(document).on("knack-records-render.view_7880", function (event, view, data) {
    setupExpandableGridViewGroups(view);
});

$(document).on("knack-records-render.view_7883", function (event, view, data) {
    setupExpandableGridViewGroups(view);
});

$(document).on("knack-records-render.view_7884", function (event, view, data) {
    setupExpandableGridViewGroups(view);
});

$(document).on("knack-records-render.view_7885", function (event, view, data) {
    setupExpandableGridViewGroups(view);
});

$(document).on("knack-records-render.view_7886", function (event, view, data) {
    setupExpandableGridViewGroups(view);
});

$(document).on("knack-records-render.view_7887", function (event, view, data) {
    setupExpandableGridViewGroups(view);
});

$(document).on("knack-records-render.view_7888", function (event, view, data) {
    setupExpandableGridViewGroups(view);
});

//Generic helper function to make the expandable groups work with any view
function setupExpandableGridViewGroups(view) {
  // Function to generate a unique identifier for each group
  function getGroupId(groupRow) {
    return "group-state-" + view.key + "-" + groupRow.index();
  }

  // Function to toggle group visibility and icon
  function toggleGroup(groupRow, forceCollapse = false) {
    var groupId = getGroupId(groupRow);
    var rowsToToggle = groupRow.nextUntil(".kn-table-group");
    var isExpanded = rowsToToggle.first().is(":visible");

    if (isExpanded || forceCollapse) {
      rowsToToggle.hide();
      groupRow
        .find(".expand-collapse")
        .removeClass("fa-minus-square-o")
        .addClass("fa-plus-square-o");
      localStorage.setItem(groupId, "collapsed");
    } else {
      rowsToToggle.show();
      groupRow
        .find(".expand-collapse")
        .removeClass("fa-plus-square-o")
        .addClass("fa-minus-square-o");
      localStorage.setItem(groupId, "expanded");
    }
  }

  // Initialize groups and add expand-collapse icon
  $("#" + view.key + " .kn-table-group").each(function () {
    var groupRow = $(this);

    // Add icon if not already present
    if (!groupRow.find(".expand-collapse").length) {
      groupRow
        .find("td:first")
        .prepend(
          '<i class="fa fa-plus-square-o expand-collapse" style="cursor: pointer; margin-right: 5px;"></i>'
        );
    }

    // Attach click event to toggle group
    groupRow.off("click").on("click", function () {
      toggleGroup(groupRow);
    });

    // Collapse all groups on initial load
    toggleGroup(groupRow, true);
  });

  // Restore group states from Local Storage
  $("#" + view.key + " .kn-table-group").each(function () {
    var groupRow = $(this);
    var groupId = getGroupId(groupRow);
    var state = localStorage.getItem(groupId);

    if (state === "expanded") {
      toggleGroup(groupRow);
    }
  });
}
