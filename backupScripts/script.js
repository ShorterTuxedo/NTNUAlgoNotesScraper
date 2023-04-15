$ = {};

// reset the style of English words in <p>
$.English = function()
{
	var c = '[ -ωᴀ-Ɀ𝐀-𝟿ᐟ𐞥]';
	var regex = new RegExp(`(${c}+)`,'giu');
	var head = new RegExp(`^${c}`,'iu');
	var tail = new RegExp(`${c}$`,'iu');
	for (let p of document.querySelectorAll('p'))
	{
		for (let node of p.childNodes)
			if (node.nodeType == 3)
			{
				node.nodeValue = node.nodeValue.replace(regex, ' $1 ');

				if (node.previousSibling && tail.test(node.previousSibling.innerHTML))
					if (head.test(node.nodeValue))
						node.nodeValue = node.nodeValue.replace(/^ /, '');
					else
						node.nodeValue = ' ' + node.nodeValue;

				if (node.nextSibling && head.test(node.nextSibling.innerHTML))
					if (tail.test(node.nodeValue))
						node.nodeValue = node.nodeValue.replace(/ $/, '');
					else
						node.nodeValue = node.nodeValue + ' ';
			}
			else
			{
				node.innerHTML = node.innerHTML.replace(regex, ' $1 ').replace(/^ /, '').replace(/ $/, '');
			}
		p.innerHTML = p.innerHTML.replace(/^ /, '').replace(/ $/, '');
	}
}

// generate container of <img>
// for x-scrolling in mobile
$.Image = function()
{
	for (let img of document.querySelectorAll('.c > img'))
	{
		var div = document.createElement('DIV');
		div.className = 'i';
		img.parentNode.replaceChild(div, img);
		div.appendChild(img);
	}
}

// generate the hyperlinks of the exercises
$.ProbLink = function()
{
	var ojs = 'uva icpc luogu'.split(' ');
	var oj = 'uva';
	for (let p of document.querySelectorAll('p.e'))
		for (let s of p.textContent.split(' '))
		{
			var name = s.toLowerCase();
			if (ojs.indexOf(name) != -1) {oj = name; continue;}

			var t = s;
			if      (oj == 'uva')   t = '<a href="http://uva.onlinejudge.org/external/' + s.slice(0,-2) + '/' + s + '.pdf">' + s + '</a>';
			else if (oj == 'icpc')  t = '<a href="http://icpcarchive.ecs.baylor.edu/external/' + s.slice(0,-2) + '/' + s + '.pdf">' + s + '</a>';
			else if (oj == 'luogu') t = '<a href="https://www.luogu.com.cn/problem/' + s + '">' + s + '</a>';

			p.innerHTML = p.innerHTML.replace(s, t);
		}
}

// generate the hyperlinks in <pre>
$.PreLink = function()
{
	for (let pre of document.querySelectorAll('pre'))
		pre.innerHTML = pre.innerHTML.replace(/(?<!["'=\/])(https?:\/\/[^<>\s]+)/gi, '<a href="$1">$1</a>');
}

// include JavaScript file
$.JavaScript = function()
{
	for (let include of document.querySelectorAll('link[as=script]'))
	{
		var script = document.createElement('SCRIPT');
		script.src = include.getAttribute('href');
		script.async = false;
		document.body.appendChild(script);
	}
}

// include HTML file
$.HTML = function()
{
	for (let include of document.querySelectorAll('link[rel=include]'))
	{
		var file = include.getAttribute('href');
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function()
		{
			if (xhr.readyState == 4 && xhr.status == 200)
			{
				document.body.appendChild(document.createRange().createContextualFragment(xhr.responseText));
				$.DemoLink();
			}
		};
		xhr.open("GET", file, true);
//		xhr.overrideMimeType('text/plain; charset=utf-8');
		xhr.send();
	}
}

// view source code of <canvas> and <input>
$.DemoLink = function()
{
	for (let canvas of document.querySelectorAll('CANVAS, INPUT'))
	{
		var script = document.querySelector('script#' + canvas.id + '\\.js');
		if (!script) continue;

		var div = document.querySelector('div[name="' + canvas.id + '"]');
		if (div) continue;

		var pin = document.createElement('DIV');
		pin.style.display = 'inline';
		pin.style.position = 'absolute';
		pin.style.width = '0';
		pin.style.height = '0';

		var div = document.createElement('DIV');
		div.setAttribute('name', canvas.id);
		div.innerHTML = '🗎';
		div.style.cursor = 'pointer';
		div.style.position = 'relative';

		var style = window.getComputedStyle(canvas, null);
		if (canvas.tagName === 'CANVAS')
		{
			if (style.display === 'block')
			{
				div.style.left = canvas.clientWidth / 2 - 15 + 'px';
				div.style.bottom = canvas.clientHeight + 5 + 'px';
			}
			else if (style.display === 'inline' || style.display === 'inline-block')
			{
				div.style.top = '-3px';
				div.style.left = '-16px';
			}
		}
		else if (canvas.tagName === 'INPUT')
		{
			div.style.left = canvas.clientWidth / 2 + 5 + 'px';
			div.style.bottom = canvas.clientHeight + 15 + 'px';
		}

		div.addEventListener('click', function(event)
		{
			var name = event.target.getAttribute('name');
			var script = document.querySelector('script#' + name + '\\.js');
			if (!script) return;

			var code = canvas.outerHTML.replace(/ tab.*?".*?"/,"").replace(/ style.*?".*?"/,"") + '\n' + script.outerHTML;

			var html = '<!DOCTYPE html>\n'
			+'<base href="https://web.ntnu.edu.tw/~algo/" target="_blank">'
			+'<link rel="stylesheet" href="style.css">'
			+'<script src="script.js" defer></script>'
			+'<textarea>\n' + code + '\n</textarea>';

			var blob = new Blob([html], {type: 'text/html;charset=UTF-8'});
			var url = window.URL.createObjectURL(blob);
			window.open(url);
		});

		canvas.parentNode.insertBefore(pin, canvas.nextSibling);
		pin.appendChild(div);
	}
}

// load video on scrolling
$.LazyLoad = function()
{
	// only firefox need Lazyload
//	if (typeof InstallTrigger === 'undefined') return;

	var zz = document.querySelectorAll('.z');
	if (zz.length == 0) return;

	load();
	window.addEventListener('resize', load);
	window.addEventListener('scroll', load);

	function visible(element)
	{
		var rect = element.getBoundingClientRect();
		return !(rect.top >= window.innerHeight || rect.bottom <= 0
			|| rect.left >= window.innerWidth || rect.right <= 0);
	}

	function load()
	{
		for(let z of zz) if(visible(z))
		{
			var div = document.createElement('DIV');
			div.innerHTML = z.childNodes[0].nodeValue;
			z.parentNode.replaceChild(div, z);
		}
	}
};

// load and play video on scrolling
$.LazyPlay = function()
{
	var videos = document.querySelectorAll('video[preload=none]');
	if (videos.length == 0) return;

	play();
	window.addEventListener('resize', play);
	window.addEventListener('scroll', play);

	function visible(element)
	{
		var rect = element.getBoundingClientRect();
		return !(rect.top >= window.innerHeight || rect.bottom <= 0
			|| rect.left >= window.innerWidth || rect.right <= 0);
	}

	function play()
	{
		for (let video of videos)
			if (visible(video))
				video.play();
			else
				video.pause();
	}
};

// regular expressions
$.types =
	'void char bool short int long float double unsigned '
	+ 'auto clock_t nullptr_t size_t va_list var let';

$.keywords =
	'alignas alignof break case catch class const const_cast '
	+'constexpr continue default delete do dynamic_cast '
	+'else enum explicit extern false for friend goto '
	+'if inline mutable namespace new nullptr operator '
	+'private public protected register reinterpret_cast '
	+'return sizeof static static_cast struct switch template '
	+'this throw true try typedef typeof typeid typename '
	+'union using virtual volatile while '
	+'await debugger export extends function finally '
	+'of implements import interface instanceof '
	+'null package super with yield';

$.MakeRegExp = function(str, mod) 
{
	return new RegExp('\\b' + str.replace(/ /g, '\\b|\\b') + '\\b', mod);
}

$.regexps =
[
	{r:/(\/\/ )?(https?:\/\/\S+)/g, css:'link'},
	{r:/(\/\/.*?$)|(\/\*.*?\*\/)/gms, css:'comment'},
	{r:/^[ \t]*#.*?(?=$|\/\/|\/\*)/gm, css:'macro'},
	{r:/("([^"\\\n]|\\.)*")|('([^'\\\n]|\\.)*')|(`([^`\\]|\\.)*`)/g, css:'string'},	// modifier s for line continuation
	{r:$.MakeRegExp($.keywords,'g'), css:'keyword'},
	{r:$.MakeRegExp($.types,'g'), css:'type'},
	{r:/\b0([xX][\da-fA-F]+)|([bB][01]+)/g, css:'hex'},
	{r:/\b(\d*\.)?\d+([eE][+-]?\d+)?/g, css:'value'}
];

$.Color = function(str, css)
{
	if (str == null || str.length == 0) return;

	var lines = str.split('\n');
	for (var i = 0; i < lines.length; i++)
	{
		if (lines[i] !== '')
		{
			// discard createTextNode() for convenience
			var span = document.createElement('SPAN');
			if (css !== null) span.className = css;
			span.textContent = lines[i];
			if (css === 'link') span.innerHTML = lines[i].replace(/(https?:\/\/\S+)/g, '<a href="$1">$1</a>');
			$.li.appendChild(span);
		}

		if (i + 1 < lines.length)
		{
			// add line break for copy-paste
			if ($.li.textContent === '') $.li.textContent = '\n';
			$.ol.appendChild($.li);
			$.li = document.createElement('LI');
		}
	}
}

$.Parse = function(element)
{
	$.ol = document.createElement('OL');
	$.li = document.createElement('LI');

	// there is no way to get original text
	// innerText: HTML entity -> single character
	// innerHTML: HTML entity <- single character
	var text = element.textContent;
	var m = new Array($.regexps.length).fill({index: -1});
	var q = 0;

	while (1)
	{
		var ii = -1;
		var p = text.length;
		for (let i = 0; i < $.regexps.length; i++)
		{
			if (m[i] === null) continue;
			if (m[i].index < q)
			{
				$.regexps[i].r.lastIndex = q;
				m[i] = $.regexps[i].r.exec(text);
			}
			if (m[i] === null) continue;
			if (m[i].index < p) {p = m[i].index; ii = i;}
		}

		if (ii === -1) {$.Color(text.slice(q), null); break;}
		$.Color(text.slice(q, p), null);
		$.Color(m[ii][0], $.regexps[ii].css);
		q = $.regexps[ii].r.lastIndex;
	}

	var div = document.createElement('DIV');
	div.className = 'sh';
	div.appendChild($.ol);
	element.parentNode.replaceChild(div, element);
//	$.li.remove();
}

$.Highlight = function()
{
	for (textarea of document.querySelectorAll('textarea'))
		$.Parse(textarea);
}

$.toHeadings = function() {
	document.querySelectorAll("p.b").forEach(h1 => {
		let newh1 = document.createElement("h1");
		newh1.innerHTML = h1.innerHTML;
		h1.getAttributeNames().forEach(attr => {
			newh1.setAttribute(attr, h1.getAttribute(attr));
		});
		/* h1.parentElement.appendChild(newh1);
		h1.parentElement.insertBefore(h1, newh1);
		h1.parentElement.removeChild(h1); */
		h1.outerHTML = newh1.outerHTML;
	});
	document.querySelectorAll("p.t").forEach(h2 => {
		let newh2 = document.createElement("h2");
		newh2.innerHTML = h2.innerHTML;
		h2.getAttributeNames().forEach(attr => {
			newh2.setAttribute(attr, h2.getAttribute(attr));
		});
		/* h2.parentElement.appendChild(newh2);
		h2.parentElement.insertBefore(h2, newh2);
		h2.parentElement.removeChild(h2); */
		h2.outerHTML = newh2.outerHTML;
	});
};

$.Highlight();
$.English();
$.Image();
$.ProbLink();
$.PreLink();
$.JavaScript();
$.HTML();
$.DemoLink();
$.LazyLoad();
$.LazyPlay();
$.toHeadings();