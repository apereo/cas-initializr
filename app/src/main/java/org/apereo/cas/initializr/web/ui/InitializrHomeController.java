package org.apereo.cas.initializr.web.ui;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.ModelAndView;

/**
 * This is {@link InitializrHomeController}.
 *
 * @author Misagh Moayyed
 * @since 7.0.0
 */
@Controller
public class InitializrHomeController {
    @GetMapping("/ui")
    public ModelAndView ui() {
        return new ModelAndView("index");
    }

    @GetMapping(path = "/", produces = MediaType.TEXT_HTML_VALUE)
    public String redirectToUi() {
        return "forward:/ui";
    }
}
