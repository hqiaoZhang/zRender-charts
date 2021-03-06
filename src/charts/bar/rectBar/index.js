/**
 * @Author:      zhanghq
 * @DateTime:    2017-12-26 17:19:29
 * @Description: 矩形图表
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-12-26 17:19:29
 */

import zrender from 'zrender'
import _ from 'lodash'
import { YAxis, XAxis } from '../../util/axis'
import { InitZr } from '../../util/initZr'
import { CountMargin } from '../../util/util'
import { showTips, hideTips } from './tips.js'

export default class RectBar {
  /**
   * 图表默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting () {
    return{
      width: 600,
      height: 300,
      itemStyle: {
        width: 15,
        radius: 10,
        fill: '#3ed5de',
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 10
        }
      },
      margin: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 50
      }
    }  
  }
 
  /**
   * Creates an instance of RectBar
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    // 获取配置项
    this.selector = selector
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
    const { width, height } = this.config
    let margin = new CountMargin(this.config)
    this.config = _.merge({}, this.config, margin)
    // 初始化zrender
    this.zr = new InitZr(selector, width, height)
    // 实例化Y轴 
    this.yAxis = new YAxis(this.zr, this.config)
    // 实例化X轴
    this.xAxis = new XAxis(this.zr, this.config)
    // 渐变创建
    this.gradient = [
      new zrender.LinearGradient(0, 0, 1, 1, [
        {
          offset: 0,
          color: '#FFB166'
        },
        {
          offset: 1,
          color: '#37B0FF'
        }
      ]),
      new zrender.LinearGradient(0, 0, 1, 1, [
        {
          offset: 0,
          color: 'red'
        },
        {
          offset: 1,
          color: '#37B0FF'
        }
      ])
    ]
  }
 
  /**
   *  渲染
   *  @example: [
   *    {
   *     'name': '@cname', // 名称
   *     'value|1-1000': 1 // 数值
   *   }
   *  ]
   *  @param    {array}  data 图表数据
   *  @return   {void}  void
   */
  render(data) {
    const self = this
    // 清除画布
    self.zr.clear()
    // 获取value值
    let dataset = []
    data.map(d => dataset.push(d.value))
    // 渲染X轴
    self.xScale = self.xAxis.render(data)
    // 渲染Y轴
    self.yScale = self.yAxis.render(dataset)
    // 渲染矩形条
    self.drawRect(data) 
  }

  /**
   *  画矩形
   *  @param    {array}  data 图表数据
   *  @return   {void}  
   */
  drawRect(data) {
    const self = this
    const { height, itemStyle, margin } = self.config
    const { bottom, left } = margin
    const { width: iWidth, radius} = itemStyle
    const rectG = new zrender.Group()
    rectG.position[1] = -bottom
    // 根据数据创建矩形的个数
    data.map((d, i) => {
      let h = self.yScale(d.value)
      const rect = new zrender.Rect({
        shape: {
          r: [radius, radius, 0, 0],
          x: self.xScale(i) + left - iWidth / 2,
          width: iWidth
        },
        style: {
          fill: self.gradient[0]
        },
        data: d
      })
      // 添加过渡动画
      rect.animateTo({
        shape: {
          height: h,
          y: height - h
        }
      }, 350)
      rectG.add(rect)
      // 鼠标移动事件
      rect.on('mousemove', (evt) => {
        // 获取位置
        let posi = {
          x: evt.offsetX,
          y: evt.offsetY - 60
        }
        evt.target.attr({
          style: {
            fill: self.gradient[1]
          }
        })
        // 调用提示框
        showTips(self.selector, d, posi)
        // self.zr.addHover(rect, {
        //   fill: self.gradient[1]
        // })
      })
      rect.on('mouseout', (evt) => {
        hideTips(self.selector)
        evt.target.attr({
          style: {
            fill: self.gradient[0]
          }
        })
      })
    })
    self.zr.add(rectG)
  }
}
