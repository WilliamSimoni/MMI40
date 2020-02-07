package visual;

import java.util.ArrayList;
import java.util.List;

import general.Element;
import general.IdGenerator;
import general.Props;
import general.Style;
import general.SubElement;

public class Page extends Element{

	//props
	Props url;
	Props child;
	Props subpage;
	
	
	public Page(String id) {
		super(id);
		List<Class<?>> type=new ArrayList<Class<?>>();
		type.add(String.class);
		List<Class<?>> type2=new ArrayList<Class<?>>();
		type2.add(SubElement.class);
		List<Class<?>> type3=new ArrayList<Class<?>>();
		type3.add(Page.class);
		
		this.styleList=new ArrayList<Style>();
		this.child=new Props(IdGenerator.getNextIdProps(), type2, true, true,-1);
		this.url=new Props(IdGenerator.getNextIdProps(), type, false, false,1);
		this.subpage=new Props(IdGenerator.getNextIdProps(), type3, false, false,-1);
		this.props.put("child",child);
		this.props.put("url",url);
		this.props.put("subpage",subpage);
	}

}
