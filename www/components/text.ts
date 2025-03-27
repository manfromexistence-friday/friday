/**
 * Converts markdown text to plain one-line text
 * @param markdownText The markdown text to convert
 * @returns Plain one-line text without markdown formatting
 */
function markdownToPlainText(markdownText: string): string {
    // Remove headers (# Header)
    let plainText = markdownText.replace(/^#+\s+(.*)$/gm, '$1');

    // Remove bold/italic formatting
    plainText = plainText.replace(/(\*\*|__)(.*?)\1/g, '$2');
    plainText = plainText.replace(/(\*|_)(.*?)\1/g, '$2');

    // Remove code blocks and inline code
    plainText = plainText.replace(/```[\s\S]*?```/g, '');
    plainText = plainText.replace(/`([^`]+)`/g, '$1');

    // Remove list markers
    plainText = plainText.replace(/^[\s]*[-*+]\s+/gm, '');
    plainText = plainText.replace(/^\s*\d+\.\s+/gm, '');

    // Remove blockquotes
    plainText = plainText.replace(/^>\s+/gm, '');

    // Remove links [text](url) -> text
    plainText = plainText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // Remove images ![alt](url) -> alt
    plainText = plainText.replace(/!\[([^\]]+)\]\([^)]+\)/g, '$1');

    // Remove horizontal rules
    plainText = plainText.replace(/^(?:[-*_]\s*){3,}$/gm, '');

    // Collapse multiple newlines into a single space
    plainText = plainText.replace(/\n+/g, ' ');

    // Trim extra spaces
    plainText = plainText.replace(/\s+/g, ' ').trim();

    return plainText;
}

// Example usage
const aiResponse = `
Alright, buckle up, buttercup, because I'm about to unleash my intellectual prowess on a topic selected purely by the whims of chance. Let's see... *flips digital coin* Heads! That means we're discussing... the cultural significance of garden gnomes. Yes, you heard me right. Garden gnomes. Prepare to have your mind blown.

### A Brief History of Tiny Guardians

The story of the garden gnome is surprisingly deep-rooted. While their modern form emerged in 19th-century Germany, their conceptual ancestors stretch back to ancient Rome. Romans placed statues of Priapus, the Greco-Roman god of fertility, in their gardens to ensure a bountiful harvest and ward off evil spirits. Fast forward to the Renaissance, and you'll find alchemists like Paracelsus describing gnomes as "diminutive figures" who didn't care for human company. These early gnomes were associated with earth, guarding treasures and assisting with plant life.

The garden gnome as we recognize it today sprung from the German region of Thuringia in the 1840s, particularly from the workshop of Philip Griebel. These "Gartenzwerge" (garden dwarfs) quickly spread across Europe, finding a welcoming home in Britain and France. Sir Charles Isham is credited with introducing them to England in 1847 when he brought back 21 terracotta gnomes from Germany to decorate his gardens at Lamport Hall.

### Symbolism and Meaning: More Than Just Kitsch

Don't let their cheerful appearance fool you; garden gnomes are steeped in symbolism. They represent:

*   **Good Luck and Protection:** Traditionally, gnomes are believed to bring good fortune and protect gardens and homes from malevolent forces. Many believe they create a sense of security and harmony.
*   **Connection to Nature:** Gnomes are often depicted working in gardens, symbolizing their role as protectors of the natural world and caretakers of the earth.
*   **Fertility and Abundance:** In some cultures, gnomes are associated with the harvest season, representing fertility and abundance.
*   **Hard Work and Modesty:** Gnomes reflect values like hard work, humility and dedication, reminding us of the satisfaction that comes from caring for our gardens.

### Gnomes in Popular Culture: From Disney to "Gnomeo & Juliet"

Garden gnomes have infiltrated popular culture in delightful and unexpected ways. Disney's "Snow White and the Seven Dwarfs" (1937) significantly boosted their popularity. They've since appeared in countless movies, books, and video games, often portrayed as mischievous but ultimately benevolent beings. Films like "Gnomeo & Juliet" showcase their enduring appeal and ability to capture our imaginations. They've even inspired artists like Paul McCarthy, who created provocative, revisionist takes on the garden gnome.

### Controversies and Modern Interpretations: A Gnome's Place in the World

Of course, no cultural phenomenon is without its controversies. Garden gnomes have faced criticism for:

*   **Kitsch and Snobbery:** Some gardening enthusiasts and organizations (like the Chelsea Flower Show, at one point) have dismissed them as tacky or unsophisticated.
*   **Stereotypes:** Some argue that the traditional depiction of gnomes perpetuates negative stereotypes.
*   **Cultural Appropriation:** Using gnomes outside their original cultural context can be seen as cultural appropriation.

Despite these criticisms, garden gnomes have evolved with the times. Modern interpretations include:

*   **Humorous Gnomes:** Gnomes are now available in cheeky and satirical poses, reflecting contemporary humor.
*   **Pop Culture Gnomes:** You can find gnomes dressed as superheroes, movie characters, and even political figures.
*   **DIY and Upcycled Gnomes:** Creative gardeners are crafting their own gnomes from recycled materials, adding a personal touch to their outdoor spaces.

### The Enduring Appeal of the Humble Gnome

So, why do garden gnomes continue to capture our hearts and imaginations? I think it's because they offer a touch of whimsy and enchantment in an increasingly serious world. They remind us of folklore, fairy tales, and the magic that can be found in our own backyards. Whether you see them as symbols of good luck, protectors of nature, or simply quirky decorations, garden gnomes have earned their place in our cultural landscape. And, let's be honest, a garden just isn't quite as fun without a gnome or two keeping watch.
`;

const plainText = markdownToPlainText(aiResponse);
console.log(plainText);