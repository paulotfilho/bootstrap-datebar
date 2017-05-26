(function($) {
  $.fn.datebar = function( options ) {

    var params = $.extend({
      anchorToStart: false,
      anchorToEnd: false,
      startDate: '',
      endDate: '',
      startColor: '',
      endColor: '',
      dates: [],

    }, options);

    params.startDate = moment(params.startDate);
    params.endDate = moment(params.endDate);

    $.each(params.dates, function (key, value) {
      value = moment(value);

      params.dates[key] = {
        date: value,
        isBeforeStart: isBefore(value, params.startDate),
        isBeforeEnd: isBefore(value, params.endDate),
        isAfterStart: isAfter(value, params.startDate),
        isAfterEnd: isAfter(value, params.endDate),
      };
    });

    if (params.anchorToStart) {
      params.dates = params.dates.filter(function (dateObj) {
        return !dateObj.isBeforeStart;
      });
    }

    if (params.anchorToEnd) {
      params.dates = params.dates.filter(function (dateObj) {
        return !dateObj.isAfterEnd;
      });
    }

    var allDates = params.dates.map(function (dateObj) {
      return dateObj.date;
    });

    allDates.push(params.startDate);
    allDates.push(params.endDate);

    var minDate = moment.min(allDates);
    var maxDate = moment.max(allDates);

    var datebar = '<div style="position: relative; margin-top: 20px;">' +
      '<div class="progress datebar-steps">' +
      '</div>' +
      '</div>';

    $(".datebar").html(datebar);

    allDates.map(function (dateObj) {
      var percentage = getDatePercentage(dateObj);
      var step = '<div class="datebar-step" style="left: '+percentage+'%">' +
        '<div class="datebar-label-date">'+dateObj.format('DD/MM')+'</div>' +
        '<div class="datebar-label-percent">'+percentage+'%</div>' +
        '</div>';

      $(".datebar-steps").append(step);
    });

    console.log(allDates);

    function getDatePercentage(date) {
      return Math.round(((date.unix() - minDate.unix()) / (maxDate.unix() - minDate.unix())) * 100);
    }
    
    function isBefore(firstDate, secondDate) {
      return (firstDate.isBefore(secondDate)) ? true : false;
    }

    function isAfter(firstDate, secondDate) {
      return (firstDate.isAfter(secondDate)) ? true : false;
    }
  }
}(jQuery));