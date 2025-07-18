/***
|Name        |VerticalSplitScreenPlugin|
|Description |Opens a new pop-up window with a vertical split view, displaying the current page and another URL in a frameset.|
|Source      |https://wangyenshu.github.io#VerticalSplitScreenPlugin|
|Version     |0.1|
|Author      |Yanshu Wang, with the help of AI|
|License     |MIT|
|~CoreVersion|2.x|
|Type        |plugin|
!!!!!Documentation
Use the {{{<<VerticalSplitScreen>>}}} macro to display a button that launches the vertical split-screen browser.
It will open in a new pop-up window, prompting for a URL for the right pane.
<<VerticalSplitScreen>>
!!!!!Code
***/
//{{{
config.macros.VerticalSplitScreen = {
    handler: function(place, macroName, params, wikifier, paramString, tiddler) {
        // Create a button element
        var button = document.createElement("button");
        button.innerText = "Open Vertical Split Screen"; // Text displayed on the button
        button.title = "Click to open a vertical split screen view on the current page"; // Tooltip

        // Add basic styling classes for consistency with TiddlyWiki buttons
        button.className = "tiddlyLink button";

        button.onclick = function() {
            var href = location.href;
            // Prompt for the URL for the right frame.
            var website = prompt('Please enter the URL for the right pane:', '') || href;

            // Remove any existing split screen containers or close buttons before creating new ones
            var existingContainer = document.getElementById("verticalSplitScreenContainer");
            if (existingContainer) {
                document.body.removeChild(existingContainer);
            }
            var existingCloseButton = document.getElementById("verticalSplitScreenCloseButton");
            if (existingCloseButton) {
                document.body.removeChild(existingCloseButton);
            }

            // Create the main container for the split view
            var splitContainer = document.createElement("div");
            splitContainer.setAttribute("id", "verticalSplitScreenContainer");
            splitContainer.style.position = "fixed";
            splitContainer.style.left = "0";
            splitContainer.style.top = "0";
            splitContainer.style.width = "100vw";
            splitContainer.style.height = "100vh";
            splitContainer.style.zIndex = "99999"; // High z-index to overlay content
            splitContainer.style.display = "flex"; // Use flexbox for side-by-side layout
            splitContainer.style.border = "none";
            splitContainer.style.margin = "0";
            splitContainer.style.padding = "0";
            splitContainer.style.backgroundColor = "white"; // Ensure background is solid if iframes don't load fully

            // Create the left iframe for the current page
            var leftIframe = document.createElement("iframe");
            leftIframe.style.width = "50%";
            leftIframe.style.height = "100%";
            leftIframe.style.border = "none";
            leftIframe.style.margin = "0";
            leftIframe.style.padding = "0";
            leftIframe.src = href; // Load current page into left iframe

            // Create the right iframe for the specified website
            var rightIframe = document.createElement("iframe");
            rightIframe.style.width = "50%";
            rightIframe.style.height = "100%";
            rightIframe.style.border = "none";
            rightIframe.style.margin = "0";
            rightIframe.style.padding = "0";
            rightIframe.src = website; // Load user-specified website into right iframe

            // Append iframes to the container
            splitContainer.appendChild(leftIframe);
            splitContainer.appendChild(rightIframe);

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
            closeButton.setAttribute("id", "verticalSplitScreenCloseButton");

            closeButton.onclick = function() {
                var containerToRemove = document.getElementById("verticalSplitScreenContainer");
                if (containerToRemove) {
                    document.body.removeChild(containerToRemove);
                }
                var buttonToRemove = document.getElementById("verticalSplitScreenCloseButton");
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