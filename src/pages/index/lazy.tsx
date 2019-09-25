import Taro, {Component} from '@tarojs/taro';
import {View, Image} from '@tarojs/components';
import ListView from '../../components/list-view';
import LazyBlock from '../../components/list-view/block';

let pageIndex = 1;

export default class Index extends Component {
  state = {
    isLoaded: false,
    error: false,
    hasMore: true,
    isEmpty: false,
    list: [],
  };

  getData = async (pIndex = pageIndex) => {
    if (pIndex === 1) this.setState({isLoaded: false})
    const { data: { data } } = await Taro.request({
      url: 'https://cnodejs.org/api/v1/topics',
      data: {
        limit: 10,
        page: pIndex
      }
    })
    return {list : data, hasMore: true, isLoaded: pIndex === 1};
  };

  componentDidMount() {
    this.refList.fetchInit()
  }

  pullDownRefresh = async (rest) => {
    pageIndex = 1;
    const res = await this.getData(1);
    this.setState(res);
    rest()
  };

  onScrollToLower = async (fn) => {
    const {list} = this.state;
    const {list: newList, hasMore} = await this.getData(++pageIndex);
    this.setState({
      list: list.concat(newList),
      hasMore
    });
    fn();
  };

  refList = {};

  insRef = (node) => {
    this.refList = node;
  };

  render() {
    const {isLoaded, error, hasMore, isEmpty, list} = this.state;
    return (
      <View className='skeleton lazy-view'>
        <View style={{ height: '40px'}} />
        <ListView
          lazy
          ref={node => this.insRef(node)}
          isLoaded={isLoaded}
          isError={error}
          hasMore={hasMore}
          style={{height: '50vh'}}
          isEmpty={isEmpty}
          onPullDownRefresh={fn => this.pullDownRefresh(fn)}
          onScrollToLower={this.onScrollToLower}
        >
          {list.map((item, index) => {
            return (
              <View className='item skeleton-bg' key={index}>
                <LazyBlock current={index} className='avatar'>
                  <Image className='avatar skeleton-radius' src={item.author.avatar_url} />
                </LazyBlock>
                <View className='title skeleton-rect'>
                  {item.title}
                </View>
                <View className='skeleton-rect'>
                  {item.value}
                </View>
              </View>
            )
          })}
        </ListView>
      </View>
    )
  }
}
