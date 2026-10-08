const storyNodes = {
    chooseyourcharacter:{
        text: "Ready to play ? Choose your character.",
        choices: [
            {text: "Casual", next: "start"},
            {text: "Formal", next: "start"},
            {text: "Chic", next: "start"},
            {text: "Boho", next:"start"},
            {text:"Athletic", next:"start"}
            ]
    },
    start: {
        text: "Welcome to the Fashion Quest! You are a budding stylist tasked with dressing a celebrity for a grand event. What’s your first move?",
        choices: [
            { text: "Research current fashion trends", nextNode: "research" },
            { text: "Visit a local designer for inspiration", nextNode: "designer" }
        ]
    },
    research: {
        text: "You found that 'sustainable fashion' is trending. What outfit do you suggest?",
        choices: [
            { text: "A bold futuristic jumpsuit", nextNode: "wrong1" },
            { text: "An eco-friendly gown made from recycled fabric", nextNode: "correct1" }
        ]
    },
    designer: {
        text: "The designer offers you two outfits: a classic tuxedo and a colorful avant-garde dress. What do you pick?",
        choices: [
            { text: "Classic tuxedo", nextNode: "correct1" },
            { text: "Colorful avant-garde dress", nextNode: "wrong1" }
        ]
    },
    correct1: {
        text: "Great choice! The outfit is a hit at the event. What’s your next step?",
        choices: [
            { text: "Post about the look on social media", nextNode: "socialMedia" },
            { text: "Network with fashion photographers", nextNode: "network" }
        ]
    },
    wrong1: {
        text: "Oh no! The outfit was too bold for the occasion. You can try again.",
        choices: [
            { text: "Restart", nextNode: "start" }
        ]
    },
    socialMedia: {
        text: "Your post goes viral, gaining thousands of likes! You’re invited to a fashion show. What’s your move?",
        choices: [
            { text: "Attend the show", nextNode: "fashionShow" },
            { text: "Focus on designing your own collection", nextNode: "designCollection" }
        ]
    },
    network: {
        text: "The photographers loved your work and offer to collaborate. What's your next step?",
        choices: [
            { text: "Take the opportunity", nextNode: "fashionShow" },
            { text: "Decline and start designing your own collection", nextNode: "designCollection" }
        ]
    },
    fashionShow: {
        text: "At the fashion show, you meet industry icons and your career skyrockets. Congratulations, you’ve won the game!",
        choices: [
            { text: "Part -2", nextNode: "correct2" }
        ]
    },

    // New story nodes added
    correct2: {
        text: "The eco-friendly gown is a success. You’re invited to another high-profile event. What’s your next move?",
        choices: [
            { text: "Design a custom piece for the event", nextNode: "customDesign" },
            { text: "Buy an outfit from a famous brand", nextNode: "famousBrand" }
        ]
    },
    customDesign: {
        text: "Your custom design is admired by the fashion elite. What do you do next?",
        choices: [
            { text: "Open your own boutique", nextNode: "boutique" },
            { text: "Expand into digital fashion", nextNode: "digitalFashion" }
        ]
    },
    famousBrand: {
        text: "The famous brand’s outfit steals the spotlight, but you don’t get full credit. What’s your next move?",
        choices: [
            { text: "Work with more brands", nextNode: "moreBrands" },
            { text: "Create your own brand", nextNode: "createBrand" }
        ]
    },
    boutique: {
        text: "Your boutique gains a cult following. How do you expand?",
        choices: [
            { text: "Host fashion shows", nextNode: "fashionShow2" },
            { text: "Collaborate with influencers", nextNode: "influencerCollab" }
        ]
    },
    digitalFashion: {
        text: "Your digital fashion line is a hit in virtual reality. What’s your next move?",
        choices: [
            { text: "Create limited edition virtual outfits", nextNode: "virtualOutfits" },
            { text: "Expand to NFT fashion", nextNode: "nftFashion" }
        ]
    },
    designCollection: {
        text: "Your fashion line is a hit and gets featured in Vogue. Congratulations, you’ve won the game!",
        choices: [
            { text: "Part-3", nextNode: "moreBrands" }
        ]
    },
    moreBrands: {
        text: "You expand your portfolio by working with more brands. What’s your next move?",
        choices: [
            { text: "Collaborate with influencers", nextNode: "influencerCollab" },
            { text: "Launch a new fashion line", nextNode: "launchLine" }
        ]
    },
    createBrand: {
        text: "You start your own brand, and it becomes a sensation in the industry. How do you expand?",
        choices: [
            { text: "Start an international campaign", nextNode: "internationalCampaign" },
            { text: "Partner with top designers", nextNode: "designerPartnership" }
        ]
    },
    fashionShow2: {
        text: "Your fashion shows attract top-tier clientele. You’re now a household name in fashion!",
        choices: [
            { text: "Collaborate with global brands", nextNode: "globalCollab" },
            { text: "Open more boutiques worldwide", nextNode: "globalBoutiques" }
        ]
    },
    influencerCollab: {
        text: "Your collaborations with influencers take your brand to the next level. You’re featured on the cover of major magazines!",
        choices: [
            { text: "Launch a TV fashion series", nextNode: "tvSeries" },
            { text: "Write a fashion book", nextNode: "fashionBook" }
        ]
    },
    virtualOutfits: {
        text: "Your limited edition virtual outfits are in high demand in virtual worlds. What’s next?",
        choices: [
            { text: "Host virtual fashion shows", nextNode: "virtualFashionShow" },
            { text: "Create a virtual clothing line for avatars", nextNode: "avatarFashion" }
        ]
    },
    nftFashion: {
        text: "Your NFT fashion line is a huge success in the metaverse. What’s your next move?",
        choices: [
            { text: "Launch a digital fashion marketplace", nextNode: "digitalMarketplace" },
            { text: "Create exclusive digital fashion experiences", nextNode: "exclusiveDigital" }
        ]
    },
    launchLine: {
        text: "Your new fashion line is taking over the market. You’re now a leading fashion mogul. What’s your next move?",
        choices: [
            { text: "Expand internationally", nextNode: "internationalExpansion" },
            { text: "Collaborate with luxury brands", nextNode: "luxuryCollaboration" }
        ]
    },
    internationalCampaign: {
        text: "Your international campaign takes your brand global. You’re now recognized worldwide!",
        choices: [
            { text: "Collaborate with celebrities", nextNode: "celebrityCollab" },
            { text: "Launch a luxury collection", nextNode: "luxuryCollection" }
        ]
    },
    designerPartnership: {
        text: "Partnering with top designers, your brand is now seen as the epitome of high fashion.",
        choices: [
            { text: "Host private fashion shows for VIPs", nextNode: "globalCollab" },
            { text: "Open pop-up shops in major cities", nextNode: "globalBoutiques" }
        ]
    },
    globalCollab: {
        text: "Your global brand collaborations open doors to even bigger opportunities.",
        choices: [
            { text: "Launch a sustainable fashion line", nextNode: "globalBoutiques" },
            { text: "Create a global fashion event", nextNode: "tvSeries" }
        ]
    },
    globalBoutiques: {
        text: "Your boutiques are now a global phenomenon. You’re a true fashion icon.",
        choices: [
            { text: "Design a global capsule collection", nextNode: "virtualFashionShow" },
            { text: "Host a global fashion week", nextNode: "fashionBook" }
        ]
    },
    tvSeries: {
        text: "Your TV fashion series becomes a hit, and you are now a household name!",
        choices: [
            { text: "Create a fashion reality show", nextNode: "grandEnding" },
            { text: "Start a mentorship program for aspiring designers", nextNode: "grandEnding" }
        ]
    },
    fashionBook: {
        text: "Your fashion book becomes a bestseller. You’re now an authority in the industry.",
        choices: [
            { text: "Start a fashion podcast", nextNode: "grandEnding" },
            { text: "Launch a fashion magazine", nextNode:"grandEnding" }
        ]
    },
    virtualFashionShow: {
        text: "Your virtual fashion shows attract millions of viewers worldwide.",
        choices: [
            { text: "Host fashion shows with celebrities", nextNode: "grandEnding" },
            { text: "Host a charity fashion show", nextNode: "grandEnding" }
        ]
    },
    avatarFashion: {
        text: "Your avatar fashion line becomes the go-to style for virtual worlds.",
        choices: [
            { text: "Create collaborations with other virtual designers", nextNode: "grandEnding" },
            { text: "Expand your avatar fashion into NFTs", nextNode: "grandEnding" }
        ]
    },
    digitalMarketplace: {
        text: "Your digital marketplace is now the leading platform for digital fashion.",
        choices: [
            { text: "Collaborate with virtual worlds", nextNode: "grandEnding" },
            { text: "Launch exclusive designer drops", nextNode: "grandEnding" }
        ]
    },
    exclusiveDigital: {
        text: "You’ve created exclusive digital fashion experiences, becoming a trailblazer in the digital space.",
        choices: [
            { text: "Host a virtual fashion awards show", nextNode: "grandEnding" },
            { text: "Design custom digital outfits for celebrities", nextNode: "grandEnding" }
        ]
    },
    internationalExpansion: {
        text: "Your fashion empire expands internationally, and you’re now a top designer in major fashion capitals.",
        choices: [
            { text: "Start your own fashion school", nextNode: "grandEnding" },
            { text: "Host a global fashion tour", nextNode: "grandEnding" }
        ]
    },
    luxuryCollaboration: {
        text: "Collaborating with luxury brands, your designs are now seen on the world’s elite.",
        choices: [
            { text: "Create an exclusive line for high-end stores", nextNode: "grandEnding" },
            { text: "Start a luxury fashion line", nextNode: "grandEnding" }
        ]
    },
    celebrityCollab: {
        text: "Your collaborations with celebrities open doors to massive opportunities in the fashion industry.",
        choices: [
            { text: "Launch a fashion documentary", nextNode: "grandEnding" },
            { text: "Start your own fashion brand with celebrities", nextNode: "grandEnding" }
        ]
    },
    luxuryCollection: {
        text: "Your luxury collection becomes the talk of the fashion world. You're now a top designer!",
        choices: [
            { text: "Expand into haute couture", nextNode: "grandEnding" },
            { text: "Create a signature perfume", nextNode: "grandEnding" }
        ]
    }, 
}