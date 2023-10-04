import {initialize_map, fillPopularImagesPanel} from './viewer';
import './app-history';
import './search';

$(function() {
  fillPopularImagesPanel();
  initialize_map();
});
