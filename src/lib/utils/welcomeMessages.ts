/**
 * 欢迎消息工具
 * 提供随机的欢迎消息
 */

/**
 * 从数组中获取随机元素
 * @param array 源数组
 * @returns 随机选取的元素
 */
export function getRandomItem<T>(array: T[]): T {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
} 

/**
 * Bloom Protocol欢迎消息列表
 */
export const welcomeMessages = [
  "🚀 Bloom Protocol: To the moon! 😎",
  "🌱 Bloom Protocol: Growing the future of Web3!",
  "💪 Bloom Protocol: Building community, one block at a time!",
  "🔮 Bloom Protocol: The future is blooming!",
  "🌈 Bloom Protocol: Where dreams grow!",
  "⚡ Bloom Protocol: Let's build together!",
  "🌟 Bloom Protocol: Shine bright with us!",
  "🌍 Bloom Protocol: Changing the world!",
  
  // Additional messages to expand to 100
  "🏗️ Bloom Protocol: Building the future!",
  "🎯 Bloom Protocol: Hitting targets, making impact!",
  "🔑 Bloom Protocol: Unlocking potential!",
  "🌊 Bloom Protocol: Riding the wave of innovation!",
  "🧠 Bloom Protocol: The smart choice!",
  "🌐 Bloom Protocol: Connecting worlds!",
  "💡 Bloom Protocol: Where brilliant ideas bloom!",
  "🚀 Bloom Protocol: Your ticket to success!",
  "🌿 Bloom Protocol: Sustainable growth starts here!",
  "🔥 Bloom Protocol: Heating up the space!",
  "⚔️ Bloom Protocol: Cutting-edge technology!",
  "🧩 Bloom Protocol: Where all pieces connect!",
  "🎁 Bloom Protocol: The gift of decentralization!",
  "🌅 Bloom Protocol: A new dawn for Web3!",
  "🌈 Bloom Protocol: Find your pot of gold here!",
  "🎮 Bloom Protocol: Level up your experience!",
  "🔍 Bloom Protocol: Discovering new possibilities!",
  "🎨 Bloom Protocol: Painting the future!",
  "📱 Bloom Protocol: Stay connected!",
  "🎭 Bloom Protocol: The drama-free zone!",
  "🔒 Bloom Protocol: Security comes first!",
  "🎶 Bloom Protocol: The rhythm of innovation!",
  "🧪 Bloom Protocol: Experimenting with greatness!",
  "🎯 Bloom Protocol: Precision and purpose!",
  "⏰ Bloom Protocol: It's time to build!",
  "🏆 Bloom Protocol: The champion's choice!",
  "🎈 Bloom Protocol: Let your dreams soar!",
  "🌦️ Bloom Protocol: Weather any storm with us!",
  "🎪 Bloom Protocol: Welcome to the greatest show!",
  "💫 Bloom Protocol: Reaching for the stars!",
  "🧲 Bloom Protocol: Attracting success!",
  "🎵 Bloom Protocol: Dance to the beat of innovation!",
  "🏄 Bloom Protocol: Riding the wave of change!",
  "🦚 Bloom Protocol: Stand out proudly!",
  "📚 Bloom Protocol: Learning and growing together!",
  "🦄 Bloom Protocol: Where magic happens!",
  "🧮 Bloom Protocol: Calculating your success!",
  "🔆 Bloom Protocol: Brightening the future!",
  "🌠 Bloom Protocol: Make a wish!",
  "🌡️ Bloom Protocol: Things are heating up!",
  "🛤️ Bloom Protocol: On the right track!",
  "📈 Bloom Protocol: Up and to the right!",
  "🏹 Bloom Protocol: Aim high!",
  "🔋 Bloom Protocol: Fully charged!",
  "🏝️ Bloom Protocol: Your Web3 oasis!",
  "🧭 Bloom Protocol: Finding your way forward!",
  "🌻 Bloom Protocol: Growing towards the light!",
  "🔮 Bloom Protocol: The future looks bright!",
  "✨ Bloom Protocol: Sparking joy in Web3!",
  "🎣 Bloom Protocol: Get hooked on innovation!",
  "🗿 Bloom Protocol: Building monuments of change!",
  "⛳ Bloom Protocol: Achieving goals together!",
  "🍀 Bloom Protocol: Your lucky find!",
  "🌪️ Bloom Protocol: Creating positive disruption!",
  "🌉 Bloom Protocol: Bridging worlds!",
  "🎬 Bloom Protocol: Action! We're in motion!",
  "🌳 Bloom Protocol: Deep roots, high growth!",
  "🥁 Bloom Protocol: Drumroll please!",
  "💭 Bloom Protocol: Dream it, build it!",
  "🛸 Bloom Protocol: Beyond imagination!",
  "🧿 Bloom Protocol: Good vibes only!",
  "🎪 Bloom Protocol: Welcome to the revolution!",
  "🎰 Bloom Protocol: Bet on the future!",
  "🛡️ Bloom Protocol: Protection by design!",
  "🧸 Bloom Protocol: User-friendly innovation!",
  "💎 Bloom Protocol: Discovering gems together!",
  "🔄 Bloom Protocol: Constant innovation!",
  "🧵 Bloom Protocol: Weaving the future!",
  "🌀 Bloom Protocol: At the center of innovation!",
  "🧬 Bloom Protocol: The DNA of success!",
  "🏯 Bloom Protocol: Building empires!",
  "🎢 Bloom Protocol: Enjoy the ride!",
  "🧶 Bloom Protocol: Untangling Web3!",
  "🧙 Bloom Protocol: Where tech meets magic!",
  "🥇 Bloom Protocol: First place innovation!",
  "📡 Bloom Protocol: Broadcasting the future!",
  "🍭 Bloom Protocol: Sweet success awaits!",
  "⛵ Bloom Protocol: Smooth sailing ahead!",
  "🧤 Bloom Protocol: Hands-on innovation!",
  "🌋 Bloom Protocol: Erupting with ideas!",
  "📯 Bloom Protocol: Heralding a new era!",
  "🏙️ Bloom Protocol: Building digital cities!",
  "🧨 Bloom Protocol: Explosive growth ahead!",
  "🌄 Bloom Protocol: A brighter tomorrow!",
  "🎡 Bloom Protocol: The wheels of innovation turn!",
  "🦅 Bloom Protocol: Soaring high!",
  "🌟 Bloom Protocol: Your star is rising!",
  "⛩️ Bloom Protocol: Entering a new realm!",
  "🎲 Bloom Protocol: Changing the game!",
  "🎭 Bloom Protocol: All the Web3's a stage!",
  "🧩 Bloom Protocol: Completing the puzzle!",
  "🛎️ Bloom Protocol: First-class service!",
  "🌪️ Bloom Protocol: Stirring up innovation!",
  "🚩 Bloom Protocol: Planting flags in the future!"
]; 

/**
 * 获取随机欢迎消息
 */
const randomWelcomeMessage = { 
  message: getRandomItem(welcomeMessages)
}

export default randomWelcomeMessage; 