# Assignment 4 

## Assignment Overview

For this homework, the goal was to alter my previous assignment to involve both text-based and click-based story choices. I also want to start making this into a more detail step by step game.   The choices made would update the DOM and allow the user to progress through the game.

The project includes the following features:
- A text-based story with user input to progress through the game
- Multiple choices for the user that affect the story's outcome.
- Updates to the DOM based on user choices.

## Features Implemented

### HTML Structure:
- The story begins with a prompt to enter the user's name. I wanted to include the name throughout the game, which was tricky at first. After researching how to store the name and allow it to be used on all pages, along with some trial and error and help from AI, I was able to figure it out.
- Multiple decision points are presented, each with two choices. Some choices lead to different storylines, but some merge into the same path moving forward. After a choice is made, the DOM updates based on the input.

### Input Handling:
- Input is received through a text box, or by clicking on the options provided.(depending on the choice being made) Based on the user's input, different parts of the story are shown.

### Functions:
- Functions were created to handle user input, update the story.
- A function was created to check the user's input and determine the next step in the story.

### Loops and Control Structures:
- A loop was used to allow the user to continue making decisions until they encounter a "game over" scenario, forcing them to restart the story.
- `if/else` and `switch` statements were employed to handle decision-making based on the user's choices.

### Style Updates:
- JavaScript was used to dynamically change the background image and text styling based on the user's choices in the story.

### Restarting the Story:
- After a poor decision leads to "game over," the user must restart their journey.

## Technical Details

### HTML:
- Basic HTML structure with `div` elements to hold the story text, input fields, and buttons.
- IDs were used to target specific elements and update their content.

### CSS:
- The styles are updated using JavaScript.
- Background images are applied based on user choices.
- Text and button styling are updated as the story progresses.

### JavaScript:
- Event listeners were used for user-based input and triggered story updates.
- Functions were used to handle input validation and return output based on user decisions.

## Challenges Faced

1. **User Input Storage:** Storing the user's name throughout the game was tricky at first, but with some research, I found the right way to store it globally and use it on all pages.
2. **Testing:** I tend to get ahead of myself while writing code and don't always test as frequently as I should. This led to challenges in finding and fixing typos or mistakes or simply why something isnt working.
3. **Over-reliance on AI:** While using AI has been helpful in making the project work more efficiently, I feel that I’ve started to rely on it a bit too much. It’s a great tool, but I need to balance its use and make sure I’m not bypassing important problem-solving steps.

## Reflection

This assignment allowed me to combine my knowledge of HTML, CSS, and JavaScript to create a dynamic and interactive story. While the structure and functionality worked well, I realized that I need to focus more on the visual aspects to make the experience more engaging for users. 

I also learned that testing frequently and not rushing through the coding process is crucial for a smoother development experience. I found some bugs simply because I didn’t test the features as often as I should have.

Using ChatGPT was a big help in structuring my code and fixing mistakes, but I also feel that I relied on it too much. While it was effective, I need to push myself to problem-solve independently more often to build my own coding skills.

## Conclusion

I entered the assignment parameters directly from canvas into chatgpt.  It did output a completely smooth functioning story line that hit all the points of the assignment.  However, over all it was bland, no images nothing visually interesting.  It was just text and text boxes.  Also I found the story itself bland and lacking of appeal.  AI is a great for technical stuff but lacks the imagination of the human mind.  

