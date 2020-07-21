import { Wechaty, Message, UrlLink } from 'wechaty'
import { PuppetPadplus } from 'wechaty-puppet-padplus'
import { EventLogger, QRCodeTerminal } from 'wechaty-plugin-contrib'
import { WechatyWeixinOpenAI, SentimentData } from 'wechaty-weixin-openai'

import { padplusToken, juzibotIntro, juzibotIntroUrl } from './const'

// FIXME: change me to your weixin id
const bossId = 'lylezhuifeng'

/**
 * Initialize a puppet and wechaty
 */
const puppet = new PuppetPadplus({
  token: padplusToken,
})

const bot = new Wechaty({
  name: 'wwc-agent',
  puppet,
})

/**
 * Function to get boss contact
 */
const getBoss = async () => {
  const contact = bot.Contact.load(bossId)
  await contact.sync()
  return contact
}

/**
 * Preprocess message, if the message if sent from boss,
 * in room and mentioned the bot, will check for a list
 * of keyword, if anything matched, sent out prepared
 * materials
 * @param message received message
 */
const processCommonMaterial = async (message: Message) => {
  const room = message.room()
  const from = message.from()
  const mentionSelf = await message.mentionSelf()
  const text = message.text()

  if (room !== null && from.id === bossId && mentionSelf) {
    if (/句子互动/.test(text)) {
      await room.say(juzibotIntro)
      await room.say(new UrlLink(juzibotIntroUrl))
      return true
    }
  }
  return false
}

/**
 * Enable basic plugins here
 *   EventLogger: print log for all events
 *   QRCodeTerminal: print a qrcode in the console for convenient scan
 */
bot.use(EventLogger())
bot.use(QRCodeTerminal({ small: true }))

// FIXME: Please change this to your OpenAI token and key
const openAIToken = 'your-openai-token'
const openAIEncodingAESKey = 'your-openai-encoding-aes-key'

/**
 * This hook function will be called when OpenAI does not match
 * any pre-set conversation
 * @param message received message
 */
const noAnswerHook = async (message: Message) => {
  const room = message.room()
  const from = message.from()
  if (!room) {
    return;
  }
  const members = await room.memberAll()
  const bossInRoom = members.find(m => m.id === bossId)
  if (bossInRoom) {
    await room.say`${bossInRoom}，${from}问的问题我不知道，你帮我回答一下吧。`
  } else {
    const boss = await getBoss()
    await room.say`${from}，你的问题我不会回答，你可以联系我的老板`
    await room.say(boss)
  }
}

/**
 * This function will be called before the action executed. With answer will be sent
 * back and the sentiment data. So we can do customize logic here for some specific
 * case. If we want to take over the job of replying this message, we need to return
 * false in the function to prevent future actions.
 * @param message received message
 * @param answer this is the answer from the OpenAI, we didn't use it here, so use _ to replace it
 * @param sentiment this is the sentiment data returned from OpenAI
 */
const preAnswerHook = async (message: Message, _: any, sentiment: SentimentData) => {
  const isCommonMaterial = await processCommonMaterial(message)
  if (isCommonMaterial) {
    return false
  }

  const hate = sentiment.hate
  const angry = sentiment.angry
  const score = (hate || 0) + (angry || 0)
  console.log(sentiment)
  if (score > 0.9) {
    const boss = await getBoss()
    const from = message.from()
    const room = await bot.Room.create([boss, from])
    await new Promise(r => setTimeout(r, 3000))
    await room.say`${boss}，你帮帮我吧，${from}和我聊天已经聊得不耐烦了`
    return false
  }
}

/**
 * Use wechaty-weixin-openai plugin here with given config
 */
bot.use(WechatyWeixinOpenAI({
  token: openAIToken,
  encodingAESKey: openAIEncodingAESKey,
  includeSentiment: true,
  noAnswerHook,
  preAnswerHook,
}))

bot.start()
