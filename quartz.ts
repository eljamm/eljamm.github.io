import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"

import { Img } from "./quartz/plugins/transformers/img"
import { Video } from "./quartz/plugins/transformers/video"

const config = await loadQuartzConfig()

config.plugins.transformers.push(Img())
config.plugins.transformers.push(Video())

export default config
export const layout = await loadQuartzLayout()
