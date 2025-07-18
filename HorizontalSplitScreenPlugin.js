/***
|Name        |HorizontalSplitScreenPlugin|
|Description |Opens a new pop-up window with a horizontal split view, displaying the current page and another URL in a frameset.|
|Source      |https://wangyenshu.github.io#HorizontalSplitScreenPlugin|
|Version     |0.1|
|Author      |Yanshu Wang, with the help of AI|
|License     |MIT|
|~CoreVersion|2.x|
|Type        |plugin|
!!!!!Documentation
Use the {{{<<HorizontalSplitScreen>>}}} macro to display a button that launches the horizontal split-screen browser.
It will open in a new pop-up window, prompting for a URL for the bottom pane.
<<HorizontalSplitScreen>>
!!!!!Code
***/
//{{{
config.macros.HorizontalSplitScreen = {
    handler: function(place, macroName, params, wikifier, paramString, tiddler) {
        // Create a button element
        var button = document.createElement("button");
        button.innerText = "Open Horizontal Split Screen"; // Text displayed on the button
        button.title = "Click to open a horizontal split screen view on the current page"; // Tooltip

        // Add basic styling classes for consistency with TiddlyWiki buttons
        button.className = "tiddlyLink button";

        button.onclick = function() {
            var href = location.href;
            // Prompt for the URL for the bottom frame.
            var website = prompt('Please enter the URL for the bottom pane:', '') || href;

            // Remove any existing split screen containers or close buttons before creating new ones
            var existingContainer = document.getElementById("horizontalSplitScreenContainer");
            if (existingContainer) {
                document.body.removeChild(existingContainer);
            }
            var existingCloseButton = document.getElementById("horizontalSplitScreenCloseButton");
            if (existingCloseButton) {
                document.body.removeChild(existingCloseButton);
            }

            // Create the main container for the split view
            var splitContainer = document.createElement("div");
            splitContainer.setAttribute("id", "horizontalSplitScreenContainer");
            splitContainer.style.position = "fixed";
            splitContainer.style.left = "0";
            splitContainer.style.top = "0";
            splitContainer.style.width = "100vw";
            splitContainer.style.height = "100vh";
            splitContainer.style.zIndex = "99999"; // High z-index to overlay content
            splitContainer.style.display = "flex"; // Use flexbox for layout
            splitContainer.style.flexDirection = "column"; // Arrange items vertically (top-bottom)
            splitContainer.style.border = "none";
            splitContainer.style.margin = "0";
            splitContainer.style.padding = "0";
            splitContainer.style.backgroundColor = "white"; // Ensure background is solid if iframes don't load fully

            // Create the top iframe for the current page
            var topIframe = document.createElement("iframe");
            topIframe.style.width = "100%";
            topIframe.style.height = "50%"; // Top half
            topIframe.style.border = "none";
            topIframe.style.margin = "0";
            topIframe.style.padding = "0";
            topIframe.src = href; // Load current page into top iframe

            // Create the bottom iframe for the specified website
            var bottomIframe = document.createElement("iframe");
            bottomIframe.style.width = "100%";
            bottomIframe.style.height = "50%"; // Bottom half
            bottomIframe.style.border = "none";
            bottomIframe.style.margin = "0";
            bottomIframe.style.padding = "0";
            bottomIframe.src = website; // Load user-specified website into bottom iframe

            // Append iframes to the container
            splitContainer.appendChild(topIframe);
            splitContainer.appendChild(bottomIframe);

            // Append the container to the document body
            document.body.appendChild(splitContainer);

            // Create a close button for the split view
            var closeButton = document.createElement("button");
            closeButton.innerText = "Close Split View";
            closeButton.style.position = "fixed";
            closeButton.style.top = "10px";
            closeButton.style.right = "10px";
            closeButton.style.zIndex = "100000"; // Higher than iframe container
            closeButton.style.padding = "5px 10px";
            closeButton.style.borderRadius = "5px";
            closeButton.style.backgroundColor = "#ff4d4d"; // Red color
            closeButton.style.color = "white";
            closeButton.style.border = "none";
            closeButton.style.cursor = "pointer";
            closeButton.setAttribute("id", "horizontalSplitScreenCloseButton");

            closeButton.onclick = function() {
                var containerToRemove = document.getElementById("horizontalSplitScreenContainer");
                if (containerToRemove) {
                    document.body.removeChild(containerToRemove);
                }
                var buttonToRemove = document.getElementById("horizontalSplitScreenCloseButton");
                if (buttonToRemove) {
                    document.body.removeChild(buttonToRemove);
                }
            };
            document.body.appendChild(closeButton);

            return false; // Prevent default button action
        };

        // Append the main plugin button to the place where the macro is called
        place.appendChild(button);
    }
};
//}}}